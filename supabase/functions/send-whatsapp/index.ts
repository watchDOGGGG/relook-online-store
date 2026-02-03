import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Store phone numbers
const BUSINESS_PHONE_1 = "+2348147134884";
const BUSINESS_PHONE_2 = "+2348135249526";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerPhone, customerName, orderId, orderItems, totalAmount } = await req.json();

    if (!customerPhone || !customerName || !orderId) {
      throw new Error("Missing required fields");
    }

    console.log(`Sending WhatsApp notification for order ${orderId} to ${customerPhone}`);

    // Format the order items for the message
    const itemsList = orderItems?.map((item: { product_name: string; quantity: number; size: number }) => 
      `• ${item.product_name} (Size ${item.size}) x${item.quantity}`
    ).join("\n") || "Order details";

    // Create the WhatsApp message
    const message = encodeURIComponent(
      `🎉 *Order Confirmation*\n\n` +
      `Hi ${customerName},\n\n` +
      `Thank you for your order! Your order #${orderId.slice(0, 8).toUpperCase()} has been received.\n\n` +
      `*Order Details:*\n${itemsList}\n\n` +
      `*Total:* ₦${totalAmount?.toLocaleString()}\n\n` +
      `You can reply to this message to track your order or ask any questions.\n\n` +
      `Thank you for shopping with us! 🙏`
    );

    // Format the customer phone number (remove spaces and ensure it starts with country code)
    let formattedPhone = customerPhone.replace(/\s+/g, "").replace(/-/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Create WhatsApp API link (using wa.me link for now)
    // In production, you would integrate with WhatsApp Business API
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${message}`;

    console.log("WhatsApp notification prepared successfully");
    console.log("Business phones for follow-up:", BUSINESS_PHONE_1, BUSINESS_PHONE_2);

    // Note: For automated WhatsApp messages, you would need to integrate with:
    // 1. WhatsApp Business API (official)
    // 2. Twilio WhatsApp API
    // 3. Other WhatsApp API providers
    
    // For now, we log the message and return success
    // The actual message sending would be done via the business WhatsApp account manually
    // or through an API integration

    return new Response(
      JSON.stringify({
        success: true,
        message: "WhatsApp notification queued",
        customerPhone: formattedPhone,
        businessPhones: [BUSINESS_PHONE_1, BUSINESS_PHONE_2],
        whatsappLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending WhatsApp notification:", error);
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
