import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in kobo
  orderId: string;
  metadata?: Record<string, unknown>;
}

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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: PaystackInitializeRequest = await req.json();
    const { email, amount, orderId, metadata } = body;

    if (!email || !amount || !orderId) {
      throw new Error("Missing required fields: email, amount, orderId");
    }

    console.log(`Initializing Paystack payment for order ${orderId}, amount: ${amount}`);

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // Amount in kobo
        reference: orderId,
        callback_url: `${req.headers.get("origin")}/order-confirmation?reference=${orderId}`,
        metadata: {
          order_id: orderId,
          ...metadata,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack API error:", data);
      throw new Error(data.message || "Failed to initialize payment");
    }

    console.log("Paystack initialization successful:", data);

    // Update order with payment reference
    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_reference: data.data.reference })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error initializing payment:", error);
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
