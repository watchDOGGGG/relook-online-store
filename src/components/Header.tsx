import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import SearchModal from "@/components/SearchModal";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  const navLinks = [
    { name: "New", href: "/shop?filter=new" },
    { name: "Running", href: "/shop?category=running" },
    { name: "Lifestyle", href: "/shop?category=lifestyle" },
    { name: "Sale", href: "/shop?filter=sale" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-border">
        {/* Top announcement bar */}
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs md:text-sm font-medium tracking-wide">
          FREE SHIPPING ON ORDERS OVER ₦75,000
        </div>

        <nav className="container-wide">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">
                Relook
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-accent ${
                    link.name === "Sale" ? "text-accent" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-secondary rounded-full transition-colors relative"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 animate-fade-in">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-base font-semibold uppercase tracking-wide ${
                    link.name === "Sale" ? "text-accent" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
