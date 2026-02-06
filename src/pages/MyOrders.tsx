import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Package, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { formatNaira } from "@/lib/formatCurrency";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = useOrders();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/my-orders");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Cart />
        <main className="pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="container-wide max-w-4xl flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="text-headline mb-8">My Orders</h1>

          {orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-lg p-6 bg-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order placed {format(new Date(order.created_at), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Order ID: {order.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          statusColors[order.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-bold">{formatNaira(order.total_amount)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex flex-wrap gap-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size} × {item.quantity}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatNaira(item.product_price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Shipping to: {order.shipping_first_name} {order.shipping_last_name},{" "}
                      {order.shipping_address}, {order.shipping_city}, {order.shipping_state},{" "}
                      {order.shipping_country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary rounded-lg">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                When you place an order, it will appear here.
              </p>
              <Link to="/shop" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
