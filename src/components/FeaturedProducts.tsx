import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { useProducts, Product } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { data: products, isLoading } = useProducts();

  // Convert database products to the format expected by ProductCard
  const convertProduct = (p: Product) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    originalPrice: p.original_price || undefined,
    images: p.images || [],
    sizes: p.sizes || [],
    category: p.category,
    isNew: p.is_new || false,
    isSale: p.is_sale || false,
  });

  const featuredProducts = (products || []).slice(0, 4).map(convertProduct);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Featured
            </span>
            <h2 className="text-headline">Trending Now</h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide hover:text-accent transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Products grid */}
        {!isLoading && featuredProducts.length > 0 && (
          <div className="product-grid">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && featuredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}

        {/* Mobile view all link */}
        {featuredProducts.length > 0 && (
          <Link
            to="/shop"
            className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 border border-border rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-secondary transition-colors"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
