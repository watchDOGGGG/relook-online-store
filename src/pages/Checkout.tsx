import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useCart } from "@/context/CartContext";
import { useCheckout, ShippingInfo } from "@/context/CheckoutContext";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useCountries } from "@/hooks/useCountries";
import { formatNaira } from "@/lib/formatCurrency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalShipping, grandTotal, clearCart } = useCart();
  const { shippingInfo, setShippingInfo, setIsPaymentComplete } = useCheckout();
  const { user } = useAuth();
  const { data: addresses } = useAddresses();
  const { countries, loading: countriesLoading } = useCountries();
  
  const [formData, setFormData] = useState<ShippingInfo>({
    ...shippingInfo,
    email: user?.email || shippingInfo.email,
  });
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/shop");
    }
  }, [items, navigate]);

  // Pre-fill email from auth user
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  // Pre-fill from default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || defaultAddr.first_name,
        lastName: prev.lastName || defaultAddr.last_name,
        phone: prev.phone || defaultAddr.phone,
        address: prev.address || defaultAddr.address,
        city: prev.city || defaultAddr.city,
        state: prev.state || defaultAddr.state,
        country: prev.country || defaultAddr.country,
        postalCode: prev.postalCode || defaultAddr.postal_code || "",
      }));
    }
  }, [addresses]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setShippingInfo(formData);
      setStep("payment");
    }
  };

  const handlePayWithPaystack = async () => {
    // Require authentication for checkout
    if (!user) {
      toast.error("Please sign in to complete your purchase");
      navigate("/auth?redirect=/checkout");
      return;
    }

    setIsProcessing(true);

    try {
      // Get current session for auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error("No active session. Please sign in again.");
      }

      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: grandTotal,
          shipping_first_name: formData.firstName,
          shipping_last_name: formData.lastName,
          shipping_email: formData.email,
          shipping_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_state: formData.state,
          shipping_country: formData.country,
          shipping_postal_code: formData.postalCode || null,
          payment_provider: "paystack",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        size: item.size,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Initialize Paystack payment with auth header
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "paystack-initialize",
        {
          body: {
            email: formData.email,
            amount: grandTotal * 100, // Convert to kobo
            orderId: order.id,
            metadata: {
              customer_name: `${formData.firstName} ${formData.lastName}`,
              phone: formData.phone,
            },
          },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData.success && paymentData.authorization_url) {
        // Store order info for confirmation page
        setIsPaymentComplete(false);
        clearCart();
        
        // Redirect to Paystack payment page
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error(paymentData.error || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide max-w-4xl">
          {/* Back button */}
          <button
            onClick={() => step === "payment" ? setStep("shipping") : navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === "payment" ? "Back to Shipping" : "Back"}
          </button>

          <h1 className="text-headline mb-8">
            {step === "shipping" ? "Shipping Information" : "Payment"}
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {step === "shipping" ? (
                <div className="space-y-6">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.firstName ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.lastName ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border border-border rounded-lg bg-secondary text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Using your account email for order confirmation
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234..."
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.phone ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
                        <span className="inline-block w-4 h-4 bg-[#25D366] rounded-full flex-shrink-0 mt-0.5"></span>
                        We'll use this WhatsApp number to send delivery updates and help track your order.
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.address ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-destructive text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* City, State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.city ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-destructive text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.state ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.state && (
                        <p className="text-destructive text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  {/* Country, Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      {countriesLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                            errors.country ? "border-destructive" : "border-border"
                          }`}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.country && (
                        <p className="text-destructive text-sm mt-1">{errors.country}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full btn-primary py-4 text-base mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Shipping summary */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Ship to:</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.city}, {formData.state} {formData.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.country}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.email} • {formData.phone}
                    </p>
                  </div>

                  {/* Paystack */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Pay with Paystack</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure payment powered by Paystack. You'll be redirected to complete your payment.
                    </p>
                    <button
                      onClick={handlePayWithPaystack}
                      disabled={isProcessing}
                      className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatNaira(grandTotal)}`
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By proceeding, you agree to our terms and conditions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-secondary rounded-lg p-6 sticky top-32">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} × {item.quantity}
                        </p>
                        <p className="font-semibold text-sm">
                          {formatNaira(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatNaira(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{totalShipping > 0 ? formatNaira(totalShipping) : <span className="text-accent">Free</span>}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatNaira(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
