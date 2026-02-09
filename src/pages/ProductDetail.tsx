import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Truck, Shield, Minus, Plus, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts, Product as DBProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/formatCurrency";
import { toast } from "sonner";

// Convert database product to the format expected by cart
const convertProduct = (p: DBProduct) => ({
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
  shippingFee: p.shipping_fee,
});

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts } = useProducts();
  
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Cart />
        <main className="pt-32 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Cart />
        <main className="pt-32 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-headline mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist.
            </p>
            <Link to="/shop" className="btn-primary">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    const cartProduct = convertProduct(product);
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, selectedSize);
    }
    
    toast.success(`${product.name} added to bag`, {
      description: `Size ${selectedSize} × ${quantity}`,
    });
  };

  // Get related products (same category, different product)
  const relatedProducts = (allProducts || [])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)
    .map(convertProduct);

  const images = product.images || [];
  const sizes = product.sizes || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Product layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 bg-secondary rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-foreground" : "border-transparent hover:border-muted-foreground"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.is_new && (
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase">
                    New
                  </span>
                )}
                {product.is_sale && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase">
                    Sale
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-headline mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                {product.original_price ? (
                  <>
                    <span className="text-2xl font-bold text-accent">
                      {formatNaira(product.price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatNaira(product.original_price)}
                    </span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-sm font-semibold rounded">
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">{formatNaira(product.price)}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Size selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Select Size</h3>
                  <button className="text-sm text-muted-foreground underline hover:text-foreground">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[38, 39, 40, 41, 42, 43, 44, 45, 46].map((size) => {
                    const isAvailable = sizes.includes(size);
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`size-btn ${isSelected ? "selected" : ""} ${
                          !isAvailable ? "disabled" : ""
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select a size
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Quantity</h3>
                <div className="inline-flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary rounded-l-full transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary rounded-r-full transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-4 text-base"
                >
                  Add to Bag — {formatNaira(product.price * quantity)}
                </button>
                <button
                  className="p-4 border border-border rounded-full hover:bg-secondary transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-4 pt-8 border-t border-border">
                <div className="flex items-center gap-4">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {product.shipping_fee && product.shipping_fee > 0
                        ? `Shipping: ${formatNaira(product.shipping_fee)}`
                        : "Free Shipping"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.shipping_fee && product.shipping_fee > 0
                        ? "Shipping fee applies to this item"
                        : "This item ships for free"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">
                      Protected payment processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 md:mt-24 pt-16 border-t border-border">
              <h2 className="text-headline mb-8">You May Also Like</h2>
              <div className="product-grid">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
