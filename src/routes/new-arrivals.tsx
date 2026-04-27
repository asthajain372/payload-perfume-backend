import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { Sparkles, ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({ meta: [{ title: "New Arrivals — Maison Aria" }] }),
  component: NewArrivalsPage,
});

type Perfume = {
  id: string; name: string; description: string | null;
  price: number; stock: number; image_url: string | null;
  category_id: string | null; created_at: string; is_new_arrival?: boolean;
};
type Category = { id: string; name: string };

function NewArrivalsPage() {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { formatPrice } = useCurrency();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [perfRes, catRes] = await Promise.all([
        supabase.from("perfumes").select("id,name,description,price,stock,image_url,category_id,created_at,is_new_arrival").order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name"),
      ]);
      setPerfumes((perfRes.data ?? []) as unknown as Perfume[]);
      setCategories(catRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "";
  const daysAgo = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  // Admin-pinned first, then by date
  const sorted = [...perfumes].sort((a, b) => {
    if (a.is_new_arrival && !b.is_new_arrival) return -1;
    if (!a.is_new_arrival && b.is_new_arrival) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.85 0.12 85 / 0.2), transparent 70%)" }} />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <Star className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            Just Arrived
          </div>
          <h1 className="font-display text-5xl font-semibold md:text-6xl">New Arrivals</h1>
          <p className="mt-4 mx-auto max-w-lg text-muted-foreground">
            The latest additions to the Maison Aria collection — freshly curated and ready to discover.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : (
          <>
            {/* Hero card — latest */}
            {sorted[0] && (
              <div className="mb-12 overflow-hidden rounded-3xl border border-border bg-card grid md:grid-cols-2" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
                  {sorted[0].image_url
                    ? <img src={sorted[0].image_url} alt={sorted[0].name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-16 w-16 text-primary/40" /></div>}
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <Badge className="mb-4 w-fit bg-primary text-primary-foreground border-0">Just Added</Badge>
                  <h2 className="font-display text-4xl font-semibold">{sorted[0].name}</h2>
                  {categoryName(sorted[0].category_id) && (
                    <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{categoryName(sorted[0].category_id)}</p>
                  )}
                  {sorted[0].description && (
                    <p className="mt-4 text-muted-foreground leading-relaxed">{sorted[0].description}</p>
                  )}
                  <div className="mt-6 flex items-center gap-4">
                    <span className="font-display text-3xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(sorted[0].price))}</span>
                    <Button asChild className="rounded-full px-6 gap-2" style={{ background: "var(--gradient-luxe)" }}>
                      <Link to="/order/$perfumeId" params={{ perfumeId: sorted[0].id }}>
                        <ShoppingCart className="h-4 w-4" /> Shop Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Rest */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.slice(1).map((p) => {
                const days = daysAgo(p.created_at);
                return (
                  <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-10 w-10 text-primary/50" /></div>}
                      </Link>
                      <button onClick={() => toggle(p.id)} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${has(p.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
                        <Heart className={`h-4 w-4 ${has(p.id) ? "fill-rose-500" : ""}`} />
                      </button>
                      {(p.is_new_arrival || days <= 7) && (
                        <Badge className="absolute left-3 top-3 border-0 text-[10px]" style={{ background: "var(--gradient-gold)", color: "var(--primary)" }}>New</Badge>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{categoryName(p.category_id)}</p>
                      <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                        <h3 className="font-display text-lg font-semibold leading-tight hover:underline underline-offset-2">{p.name}</h3>
                      </Link>
                      {p.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</span>
                        <Button size="sm" onClick={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added`); }} disabled={p.stock === 0} className="gap-1.5 rounded-full px-4">
                          <ShoppingCart className="h-3.5 w-3.5" /> Add
                        </Button>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">{days === 0 ? "Added today" : `${days}d ago`}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
