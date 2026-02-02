import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-16 md:pb-24">
        <div className="container-wide">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              New Collection
            </span>
            <h1 className="text-display text-primary-foreground mb-4">
              Step Into
              <br />
              Your Style
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg">
              Discover premium sneakers crafted for those who move with purpose. 
              Designed for comfort. Built for impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground text-primary font-bold uppercase tracking-wide rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Shop Now
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-foreground text-primary-foreground font-bold uppercase tracking-wide rounded-full hover:bg-primary-foreground/10 transition-colors">
                <Play className="w-4 h-4" fill="currentColor" />
                Watch Film
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/60">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-primary-foreground/60 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
