import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2, XCircle, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  
  const [verifying, setVerifying] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError("No payment reference found");
        setVerifying(false);
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.functions.invoke(
          "paystack-verify",
          {
            body: { reference },
          }
        );

        if (verifyError) throw verifyError;

        if (data.success) {
          setPaymentSuccess(true);
        } else {
          setError("Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [reference]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="container-wide max-w-lg text-center">
            <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="container-wide max-w-lg text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Payment Issue</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link to="/shop" className="btn-primary px-8 py-3">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide max-w-lg text-center">
          <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          {/* WhatsApp notification card */}
          <div className="bg-secondary rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  A message will be sent to your WhatsApp number confirming:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Delivery date and time
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Order tracking information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Direct support for any questions
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Order Reference: <span className="font-mono font-semibold">{reference}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary px-8 py-3">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-outline px-8 py-3">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
