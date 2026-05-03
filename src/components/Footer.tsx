import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, Heart, MapPin } from "lucide-react";
import { JD09LogoMark } from "@/components/JD09Logo";

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
            <Link to="/" className="flex items-center gap-3 mb-4">
              <JD09LogoMark className="h-12 w-auto shrink-0 text-primary-foreground/90" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold text-primary-foreground">JD09 Perfumes</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-primary-foreground/50 mt-0.5">Premium Perfume</span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Your destination for premium Arabian and international fragrances in the heart of Bur Dubai.
            </p>
            <div className="mt-4 flex items-start gap-2 text-xs text-primary-foreground/50">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Shop no -2, Taj Daulat Building,<br />
                Near Arabian Courtyard Hotel,<br />
                Opp Dubai Museum, Meena Bazar,<br />
                Bur Dubai, UAE
              </span>
            </div>
            <a
              href="https://wa.me/971555819416"
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
                  <a href="tel:+971555819416" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    +971 55 581 9416
                  </a>
                </li>
                <li>
                  <a href="tel:+971542361145" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    +971 54 236 1145
                  </a>
                </li>
                <li>
                  <a href="tel:+971502635062" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    +971 50 263 5062
                  </a>
                </li>
                <li>
                  <a href="mailto:darshanpujara82@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    darshanpujara82@gmail.com
                  </a>
                </li>
              </ul>

              <p className="mt-6 mb-3 text-xs font-medium uppercase tracking-widest text-primary-foreground/60">Follow Us</p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/jd09perfumes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/50 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com/jd09perfumes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/50 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://tiktok.com/@darshan18561"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/50 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/30">
          <span>© {new Date().getFullYear()} JD09 Perfumes. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-current" /> in Dubai
          </span>
        </div>
      </div>
    </footer>
  );
}
