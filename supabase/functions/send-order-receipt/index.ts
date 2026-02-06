import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Business WhatsApp numbers
const WHATSAPP_NUMBER_1 = "+234 8147134884";
const WHATSAPP_NUMBER_2 = "+234 8135249526";

interface OrderItem {
  product_name: string;
  quantity: number;
  size: number;
  product_price: number;
}

interface OrderReceiptRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const {
      customerEmail,
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      shippingCity,
      shippingState,
    }: OrderReceiptRequest = await req.json();

    if (!customerEmail || !customerName || !orderId) {
      throw new Error("Missing required fields");
    }

    console.log(
      `Sending order receipt to ${customerEmail} for order ${orderId}`,
    );

    // Format order items for the email
    const itemsHtml =
      orderItems
        ?.map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">Size ${item.size}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${(item.product_price * item.quantity).toLocaleString()}</td>
        </tr>
      `,
        )
        .join("") || "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background-color: #000000; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">RELOOKSTORES</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 30px;">✓</span>
                  </div>
                  <h2 style="color: #333; margin: 0 0 10px;">Order Confirmed!</h2>
                  <p style="color: #666; margin: 0;">Thank you for your purchase, ${customerName}!</p>
                </div>
                
                <!-- Order Info -->
                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Order Reference:</strong> <span style="font-family: monospace;">${orderId.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
                
                <!-- Order Items Table -->
                <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <thead>
                    <tr style="background-color: #f8f8f8;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #333;">Item</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Size</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #333;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                      <td style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #000;">₦${totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
                
                <!-- Shipping Address -->
                <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                  <p style="margin: 0; color: #666; line-height: 1.6;">
                    ${shippingAddress}<br>
                    ${shippingCity}, ${shippingState}
                  </p>
                </div>
                
                <!-- WhatsApp Section -->
                <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                  <div style="margin-bottom: 10px;">
                    <span style="font-size: 24px;">📱</span>
                  </div>
                  <h3 style="color: #166534; margin: 0 0 10px;">Track Your Order via WhatsApp</h3>
                  <p style="color: #166534; margin: 0 0 15px; font-size: 14px;">
                    Have questions about your order? Reach out to us on WhatsApp:
                  </p>
                  <p style="margin: 0; font-size: 16px;">
                    <strong style="color: #166534;">${WHATSAPP_NUMBER_1}</strong>
                    <span style="color: #666; margin: 0 10px;">or</span>
                    <strong style="color: #166534;">${WHATSAPP_NUMBER_2}</strong>
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0 0 5px;">
                    Thank you for shopping with RelookStores!
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Relookstores. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend API directly
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Relookstores <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
        html: emailHtml,
      }),
    });

    const emailData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Order receipt email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending order receipt:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
