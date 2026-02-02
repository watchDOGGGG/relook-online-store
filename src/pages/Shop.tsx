import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filter = searchParams.get("filter");
  const category = searchParams.get("category");

  // Filter products based on URL params
  let filteredProducts = [...products];

  if (filter === "new") {
    filteredProducts = filteredProducts.filter((p) => p.isNew);
  } else if (filter === "sale") {
    filteredProducts = filteredProducts.filter((p) => p.isSale);
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
    filteredProducts = filteredProducts.filter((p) => p.isNew).concat(
      filteredProducts.filter((p) => !p.isNew)
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
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
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
                      <span className="text-sm">Under $150</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">$150 - $200</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Over $200</span>
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

          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-title mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
