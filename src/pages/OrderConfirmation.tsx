import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCheckout } from "@/context/CheckoutContext";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { shippingInfo, isPaymentComplete, setIsPaymentComplete } = useCheckout();

  useEffect(() => {
    if (!isPaymentComplete) {
      navigate("/shop");
    }
    return () => {
      setIsPaymentComplete(false);
    };
  }, [isPaymentComplete, navigate, setIsPaymentComplete]);

  if (!isPaymentComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide max-w-2xl text-center">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
            <h1 className="text-headline mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          <div className="bg-secondary rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4 text-center">Order Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.firstName} {shippingInfo.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Contact Information</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            A confirmation email has been sent to {shippingInfo.email}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-outline">
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
