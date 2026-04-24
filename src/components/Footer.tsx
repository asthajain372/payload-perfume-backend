import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, Mail, MessageCircle, Heart } from "lucide-react";

const EXPLORE = [
  { to: "/collection",   label: "Collection" },
  { to: "/bestsellers",  label: "Bestsellers" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/about",        label: "About Us" },
  { to: "/contact",      label: "Contact" },
] as const;

const ACCOUNT = [
  { to: "/account",  label: "My Account" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/cart",     label: "Cart" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto" style={{ background: "var(--gradient-luxe)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display text-xl font-semibold text-primary-foreground">Maison Aria</span>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Fragrances composed with quiet precision, for those who understand that a scent is the most intimate luxury.
            </p>
            <a
              href="https://wa.me/971569270365"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-2 text-xs text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12 text-sm">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary-foreground/60">Explore</p>
              <ul className="space-y-3">
                {EXPLORE.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary-foreground/60">Account</p>
              <ul className="space-y-3">
                {ACCOUNT.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary-foreground/60">Contact</p>
              <ul className="space-y-3 text-primary-foreground/50">
                <li>
                  <a href="tel:+971569270365" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    +971 56 927 0365
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@maisonaria.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    hello@maisonaria.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/30">
          <span>© {new Date().getFullYear()} Maison Aria. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-current" /> in Dubai
          </span>
        </div>
      </div>
    </footer>
  );
}
