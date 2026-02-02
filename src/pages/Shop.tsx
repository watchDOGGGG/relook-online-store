import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import { useProducts, Product } from "@/hooks/useProducts";
import { ChevronDown, SlidersHorizontal, X, Loader2 } from "lucide-react";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const { data: products, isLoading } = useProducts();

  const filter = searchParams.get("filter");
  const category = searchParams.get("category");

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

  // Filter products based on URL params
  let filteredProducts = [...(products || [])];

  if (filter === "new") {
    filteredProducts = filteredProducts.filter((p) => p.is_new);
  } else if (filter === "sale") {
    filteredProducts = filteredProducts.filter((p) => p.is_sale);
  }

  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort products
  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    filteredProducts = filteredProducts.filter((p) => p.is_new).concat(
      filteredProducts.filter((p) => !p.is_new)
    );
  }

  const getPageTitle = () => {
    if (filter === "new") return "New Arrivals";
    if (filter === "sale") return "Sale";
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return "All Sneakers";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide">
          {/* Page header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-headline uppercase">{getPageTitle()}</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Loading..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Filters & Sort bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {showFilters && <X className="w-4 h-4" />}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-sm font-medium pr-6 cursor-pointer focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mb-8 p-6 bg-secondary rounded-lg animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                    Category
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Running</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Lifestyle</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                    Size
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[38, 39, 40, 41, 42, 43, 44, 45].map((size) => (
                      <button
                        key={size}
                        className="w-10 h-10 border border-border rounded text-sm hover:border-foreground transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                    Price
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Under ₦75,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">₦75,000 - ₦100,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Over ₦100,000</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                    Collection
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">New Arrivals</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Sale</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          )}

          {/* Product grid */}
          {!isLoading && filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={convertProduct(product)} />
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-16">
              <h3 className="text-title mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new arrivals.
              </p>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
