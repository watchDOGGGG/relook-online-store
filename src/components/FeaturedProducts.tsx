import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  const featuredProducts = products.slice(0, 4);

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

        {/* Products grid */}
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

        {/* Mobile view all link */}
        <Link
          to="/shop"
          className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 border border-border rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-secondary transition-colors"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
