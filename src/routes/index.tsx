import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import {
  Sparkles, ArrowRight, ShoppingCart, Heart,
  Leaf, Flame, Wind, Star, ChevronDown, Quote,
} from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah M.", location: "Dubai, UAE", initials: "SM",
    text: "I've tried many luxury perfumes but Maison Aria is something truly different. The longevity is incredible — I get compliments every single day without fail.",
  },
  {
    name: "James K.", location: "London, UK", initials: "JK",
    text: "The packaging alone is worth it. But the fragrance itself? Absolutely divine. It has become my signature scent and the delivery was faster than I expected.",
  },
  {
    name: "Fatima A.", location: "Abu Dhabi, UAE", initials: "FA",
    text: "I ordered three bottles as gifts and everyone adored them. Unmatched quality at this price point. The WhatsApp support team was so helpful arranging everything.",
  },
];
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Aria — Curated Luxury Perfumes" },
      { name: "description", content: "Discover Maison Aria's collection of curated luxury fragrances." },
    ],
  }),
  component: HomePage,
});

type Perfume = { id: string; name: string; description: string | null; price: number; stock: number; image_url: string | null; category_id: string | null; created_at: string; is_featured?: boolean };
type Category = { id: string; name: string; description: string | null };

const MARQUEE = ["Rare Ingredients", "Handcrafted Formulas", "Long-Lasting Silage", "Expert Curation", "Luxury Packaging", "Authentic Fragrances", "Cruelty Free", "Small Batches"];

const PILLARS = [
  { icon: Leaf, title: "Natural Origins", desc: "Every fragrance traces its heart notes to rare botanicals sourced from five continents." },
  { icon: Flame, title: "Master Noses", desc: "Each formula is composed by perfumers with decades of artisanal training in Grasse." },
  { icon: Wind, title: "Lasting Presence", desc: "Our proprietary fixative blend extends sillage for up to 12 hours on warm skin." },
  { icon: Star, title: "Curated Selection", desc: "We add fewer than twelve new fragrances per year, each passing a rigorous sensory review." },
];

function HomePage() {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { formatPrice } = useCurrency();
  const [featured, setFeatured] = useState<Perfume[]>([]);
  const [bestsellers, setBestsellers] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [perfRes, catRes, ordersRes] = await Promise.all([
        supabase.from("perfumes").select("id,name,description,price,stock,image_url,category_id,created_at,is_featured").order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name,description").order("name"),
        supabase.from("orders").select("items,status").neq("status", "cancelled"),
      ]);

      const perfs = (perfRes.data ?? []) as unknown as Perfume[];
      const orders = (ordersRes.data ?? []) as { items: unknown; status: string }[];

      // Sales map
      const salesMap = new Map<string, number>();
      for (const o of orders) {
        if (!Array.isArray(o.items)) continue;
        for (const item of o.items as { id?: string; perfume_id?: string; quantity?: number }[]) {
          const pid = item.id ?? item.perfume_id;
          if (pid) salesMap.set(pid, (salesMap.get(pid) ?? 0) + (item.quantity ?? 1));
        }
      }

      const ranked = [...perfs].sort((a, b) => (salesMap.get(b.id) ?? 0) - (salesMap.get(a.id) ?? 0));

      // Featured: admin-pinned first, fallback to first 3 in-stock
      const pinned = perfs.filter((p) => p.is_featured && p.stock > 0);
      setFeatured(pinned.length > 0 ? pinned.slice(0, 3) : perfs.filter((p) => p.stock > 0).slice(0, 3));
      setBestsellers(ranked.slice(0, 4));
      setNewArrivals(perfs.slice(0, 4));
      setCategories((catRes.data ?? []) as Category[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center text-center px-6">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.85 0.12 85 / 0.28), transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, oklch(0.72 0.14 75 / 0.14), transparent 60%)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full border opacity-[0.07]" style={{ width: 700, height: 700, borderColor: "var(--accent)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full border opacity-[0.04]" style={{ width: 1000, height: 1000, borderColor: "var(--accent)" }} />

        <div className="max-w-4xl mx-auto">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-2 text-xs uppercase tracking-widest text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            The Maison Aria Collection · Est. 2024
          </div>
          <h1 className="font-display text-6xl font-semibold leading-[1.08] tracking-tight md:text-8xl">
            Fragrances born
            <br />
            <span style={{ backgroundImage: "var(--gradient-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              from silence.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A curated house of rare and refined perfumes — each one composed with botanical precision
            and worn by those who move through the world quietly, memorably.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-lg rounded-full" style={{ background: "var(--gradient-luxe)" }}>
              <Link to="/collection">Explore the Collection <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base rounded-full">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </div>

        <a href="#featured" className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </a>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-border/60 bg-card/50 overflow-hidden py-4">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-12 pr-12">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex shrink-0 items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3 shrink-0" style={{ color: "var(--accent)" }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED ── */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Highlight</p>
            <h2 className="font-display text-4xl font-semibold">Featured Fragrances</h2>
          </div>
          <Link to="/collection" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0,1,2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <Link key={p.id} to="/order/$perfumeId" params={{ perfumeId: p.id }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${i === 0 ? "md:row-span-2" : ""}`}
                style={{ boxShadow: "var(--shadow-elegant)" }}>
                <div className={`relative overflow-hidden bg-muted ${i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-12 w-12 text-primary/50" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-display text-xl font-semibold text-white">{p.name}</p>
                    <p className="mt-1 text-sm" style={{ color: "oklch(0.85 0.12 85)" }}>{formatPrice(Number(p.price))}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-primary backdrop-blur-sm flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── FIND YOUR SCENT ── */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative overflow-hidden rounded-3xl" style={{ background: "var(--gradient-luxe)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10" style={{ background: "var(--gradient-gold)" }} />
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-48 w-48 rounded-full opacity-[0.06]" style={{ background: "var(--gradient-gold)" }} />
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 md:p-14 relative z-10">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-3">Not sure where to start?</p>
              <h2 className="font-display text-3xl font-semibold text-primary-foreground mb-3">Find your signature scent</h2>
              <p className="text-primary-foreground/70 leading-relaxed mb-7 max-w-sm text-sm">
                Explore by fragrance family — from rich oud and woods to fresh citrus and florals. Every nose has its match.
              </p>
              <Button asChild className="rounded-full px-8 h-11 gap-2" style={{ background: "var(--gradient-gold)", color: "var(--primary)" }}>
                <Link to="/collection">Explore by Family <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3 p-10">
              {["Woody & Oud", "Fresh & Citrus", "Floral & Rose", "Oriental & Spice"].map((family, i) => (
                <div key={family} className={`flex items-center gap-2.5 rounded-2xl border border-primary-foreground/10 px-4 py-3 ${i % 2 === 1 ? "mt-4" : ""}`} style={{ background: "oklch(0.18 0.02 60 / 0.3)" }}>
                  <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-primary-foreground/80">{family}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="bg-card/40 border-y border-border/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Most Loved</p>
              <h2 className="font-display text-4xl font-semibold">Bestsellers</h2>
            </div>
            <Link to="/bestsellers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0,1,2,3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.map((p) => (
                <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-8 w-8 text-primary/50" /></div>}
                    </Link>
                    <button onClick={() => toggle(p.id)} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${has(p.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
                      <Heart className={`h-4 w-4 ${has(p.id) ? "fill-rose-500" : ""}`} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                      <h3 className="font-display text-base font-semibold leading-tight hover:underline underline-offset-2">{p.name}</h3>
                    </Link>
                    {p.stock > 0 && p.stock <= 5 && (
                      <p className="mt-1 text-[10px] font-medium text-rose-500">Only {p.stock} left</p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</span>
                      <Button size="sm" disabled={p.stock === 0} className="gap-1.5 rounded-full px-3 h-8"
                        onClick={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added to cart`); }}>
                        <ShoppingCart className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Explore by Family</p>
            <h2 className="font-display text-4xl font-semibold">Fragrance Families</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.id} to="/collection" search={{ category: c.id }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none" style={{ background: "var(--gradient-gold)" }} />
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gradient-gold)" }}>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                {c.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
                  Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS STRIP ── */}
      {newArrivals.length > 0 && (
        <section className="bg-card/40 border-y border-border/50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Just In</p>
                <h2 className="font-display text-4xl font-semibold">New Arrivals</h2>
              </div>
              <Link to="/new-arrivals" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((p) => (
                <Link key={p.id} to="/order/$perfumeId" params={{ perfumeId: p.id }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ boxShadow: "var(--shadow-soft)" }}>
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-8 w-8 text-primary/50" /></div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold">{p.name}</h3>
                    <p className="mt-1 font-display text-lg" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PILLARS ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Our Philosophy</p>
          <h2 className="font-display text-4xl font-semibold">The Maison Difference</h2>
          <p className="mt-4 mx-auto max-w-xl text-muted-foreground">
            We don't follow trends. We compose for memory — for the moments a scent becomes inseparable from who you are.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "var(--gradient-gold)" }}>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What our customers say</p>
          <h2 className="font-display text-4xl font-semibold">Loved around the world</h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-0.5">
            {[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
            <span className="ml-2 text-sm text-muted-foreground">5.0 · Trusted by thousands</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, location, initials, text }) => (
            <div key={name} className="relative flex flex-col rounded-2xl border border-border bg-card p-7" style={{ boxShadow: "var(--shadow-soft)" }}>
              <Quote className="h-7 w-7 mb-4 opacity-20" style={{ color: "var(--accent)" }} />
              <p className="text-sm leading-relaxed text-muted-foreground flex-1 italic">"{text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold text-sm text-primary" style={{ background: "var(--gradient-gold)" }}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl px-10 py-16 text-center" style={{ background: "var(--gradient-luxe)" }}>
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-10" style={{ background: "var(--gradient-gold)", transform: "translate(30%, -30%)" }} />
          <Sparkles className="mx-auto mb-5 h-8 w-8 text-primary-foreground/70" />
          <h2 className="font-display text-4xl font-semibold text-primary-foreground md:text-5xl">Find your signature scent.</h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
            Every Maison Aria fragrance tells a story. Browse the full collection and discover the one that feels unmistakably yours.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-10 text-base rounded-full" style={{ background: "var(--gradient-gold)", color: "var(--primary)" }}>
            <Link to="/collection">Shop Now</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
