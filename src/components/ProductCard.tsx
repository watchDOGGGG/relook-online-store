import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { formatNaira } from "@/lib/formatCurrency";

export interface ProductCardProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: number[];
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  shippingFee?: number | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="product-card">
        {/* Image container */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="product-image w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase">
                New
              </span>
            )}
            {product.isSale && (
              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add wishlist logic
            }}
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Quick view on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium uppercase tracking-wide">
              Quick View
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.originalPrice ? (
              <>
                <span className="price-sale">{formatNaira(product.price)}</span>
                <span className="price-original">{formatNaira(product.originalPrice)}</span>
              </>
            ) : (
              <span className="price-current">{formatNaira(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
