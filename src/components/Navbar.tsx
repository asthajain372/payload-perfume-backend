import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { PromoBar } from "@/components/PromoBar";
import { Sparkles, ShoppingCart, Heart, Menu, X, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true, badge: false },
  { to: "/collection", label: "Collection", exact: false, badge: false },
  { to: "/bestsellers", label: "Bestsellers", exact: false, badge: false },
  { to: "/new-arrivals", label: "New Arrivals", exact: false, badge: true },
  { to: "/about", label: "About", exact: false, badge: false },
  { to: "/contact", label: "Contact", exact: false, badge: false },
] as const;

export function Navbar() {
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.email?.[0].toUpperCase() ?? "";

  return (
    <header className="border-b border-border/50 backdrop-blur supports-[backdrop-filter]:bg-background/90 sticky top-0 z-40">
      <PromoBar />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Maison Aria</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, exact, badge }) => {
            const active = exact ? pathname === to : pathname.startsWith(to) && (to as string) !== "/";
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm transition-colors inline-flex items-center gap-1.5",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
                {badge && !active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Currency toggle */}
          <button
            onClick={() => setCurrency(currency === "AED" ? "INR" : "AED")}
            className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card hover:bg-muted transition-colors px-3 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground"
            title="Switch currency"
          >
            {currency === "AED" ? "🇦🇪 AED" : "🇮🇳 ₹ INR"}
          </button>

          <Link
            to="/collection"
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            to="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-primary" style={{ background: "var(--gradient-gold)" }}>
                {wishCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-primary" style={{ background: "var(--gradient-gold)" }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <Link
              to="/account"
              className="hidden md:flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-border bg-card hover:bg-muted transition-colors"
              aria-label="My Account"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold text-primary" style={{ background: "var(--gradient-gold)" }}>
                {initials}
              </div>
              <span className="text-xs font-medium text-foreground">Account</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors px-3 h-9 text-sm text-muted-foreground hover:text-foreground"
              aria-label="Sign In"
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">Sign In</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur px-6 py-4">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, exact, badge }) => {
              const active = exact ? pathname === to : pathname.startsWith(to) && (to as string) !== "/";
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                  {badge && !active && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">New</span>
                  )}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border">
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full font-bold text-[11px] text-primary" style={{ background: "var(--gradient-gold)" }}>
                    {initials}
                  </div>
                  My Account
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" /> Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
