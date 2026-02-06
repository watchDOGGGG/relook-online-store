import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    // Get authorization header for user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create client with user's auth token to verify ownership
    const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUserClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Missing reference");
    }

    // Verify order ownership before proceeding
    const { data: order, error: orderError } = await supabaseUserClient
      .from("orders")
      .select("id, user_id")
      .eq("payment_reference", reference)
      .single();

    if (orderError || !order) {
      console.error("Order not found for reference:", reference, orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the order belongs to the authenticated user
    if (order.user_id !== userId) {
      console.error(`Order ownership mismatch. Order user: ${order.user_id}, Auth user: ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Order does not belong to authenticated user" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Verifying Paystack payment for reference: ${reference}`);

    // Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack verification error:", data);
      throw new Error(data.message || "Failed to verify payment");
    }

    console.log("Paystack verification response:", data);

    const isSuccessful = data.data.status === "success";

    if (isSuccessful) {
      // Use service role key only for updating order status (after ownership verified)
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Update order status to paid
      const { data: orderData, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ status: "paid", payment_reference: reference })
        .eq("payment_reference", reference)
        .select(`
          *,
          order_items (*)
        `)
        .single();

      if (updateError) {
        console.error("Error updating order status:", updateError);
      }

      // Try to send WhatsApp notification
      if (orderData) {
        try {
          const notificationResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/send-whatsapp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                customerPhone: orderData.shipping_phone,
                customerName: `${orderData.shipping_first_name} ${orderData.shipping_last_name}`,
                orderId: orderData.id,
                orderItems: orderData.order_items,
                totalAmount: orderData.total_amount,
              }),
            }
          );

          const notificationData = await notificationResponse.json();
          console.log("WhatsApp notification response:", notificationData);
        } catch (notifError) {
          console.error("Error sending WhatsApp notification:", notifError);
        }

        // Send email receipt
        try {
          const emailResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/send-order-receipt`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                customerEmail: orderData.shipping_email,
                customerName: `${orderData.shipping_first_name} ${orderData.shipping_last_name}`,
                orderId: orderData.id,
                orderItems: orderData.order_items,
                totalAmount: orderData.total_amount,
                shippingAddress: orderData.shipping_address,
                shippingCity: orderData.shipping_city,
                shippingState: orderData.shipping_state,
              }),
            }
          );

          const emailData = await emailResponse.json();
          console.log("Email receipt response:", emailData);
        } catch (emailError) {
          console.error("Error sending email receipt:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccessful,
        data: {
          status: data.data.status,
          amount: data.data.amount,
          reference: data.data.reference,
          customer_email: data.data.customer?.email,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
