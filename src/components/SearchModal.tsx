import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { searchProducts, Product } from "@/hooks/useProducts";
import { formatNaira } from "@/lib/formatCurrency";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.length > 0) {
        setIsSearching(true);
        try {
          const searchResults = await searchProducts(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-primary/50 z-50"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="fixed top-0 left-0 right-0 bg-background z-50 shadow-2xl animate-fade-in max-h-[80vh] overflow-hidden flex flex-col">
        {/* Search input */}
        <div className="p-4 md:p-6 border-b border-border">
          <div className="container-wide">
            <div className="relative flex items-center gap-4">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sneakers by name, category..."
                className="flex-1 bg-transparent text-lg md:text-xl font-medium placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container-wide">
            {query.length > 0 && !isSearching && (
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </p>
            )}

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-2">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {product.category}
                    </p>
                    <h4 className="font-semibold text-sm line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="font-semibold text-sm">
                      {formatNaira(product.price)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : query.length > 0 && !isSearching ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No sneakers found matching "{query}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for "Running" or "Lifestyle"
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Start typing to search sneakers
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <button
                    onClick={() => setQuery("Running")}
                    className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-secondary/80"
                  >
                    Running
                  </button>
                  <button
                    onClick={() => setQuery("Lifestyle")}
                    className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-secondary/80"
                  >
                    Lifestyle
                  </button>
                  <button
                    onClick={() => setQuery("Sale")}
                    className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-secondary/80"
                  >
                    Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
