import { Link } from "react-router-dom";
import sneaker1 from "@/assets/sneaker-1.jpg";
import sneaker2 from "@/assets/sneaker-2.jpg";

const CategoryBanner = () => {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Running Category */}
          <Link to="/shop?category=running" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
            <img
              src={sneaker1}
              alt="Running Collection"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <span className="text-xs uppercase tracking-widest text-primary-foreground/80 mb-2 block">
                Performance
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Running
              </h3>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground uppercase tracking-wide border-b-2 border-primary-foreground pb-1">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Lifestyle Category */}
          <Link to="/shop?category=lifestyle" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
            <img
              src={sneaker2}
              alt="Lifestyle Collection"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <span className="text-xs uppercase tracking-widest text-primary-foreground/80 mb-2 block">
                Street Style
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Lifestyle
              </h3>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground uppercase tracking-wide border-b-2 border-primary-foreground pb-1">
                Shop Now
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
