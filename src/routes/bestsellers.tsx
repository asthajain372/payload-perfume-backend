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
import { Sparkles, ShoppingCart, Heart, TrendingUp, Award, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bestsellers")({
  head: () => ({ meta: [{ title: "Bestsellers — JD09 Perfumes" }] }),
  component: BestsellersPage,
});

type Perfume = {
  id: string; name: string; description: string | null;
  price: number; stock: number; image_url: string | null;
  category_id: string | null; total_sold: number; is_bestseller?: boolean;
};

type Category = { id: string; name: string };

function BestsellersPage() {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { formatPrice } = useCurrency();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [perfRes, catsRes, ordersRes] = await Promise.all([
        supabase.from("perfumes").select("id, name, description, price, stock, image_url, category_id, is_bestseller"),
        supabase.from("categories").select("id, name"),
        supabase.from("orders").select("items, status").neq("status", "cancelled"),
      ]);

      const perfs = (perfRes.data ?? []) as unknown as Omit<Perfume, "total_sold">[];
      const orders = (ordersRes.data ?? []) as { items: unknown; status: string }[];

      // Count sales per perfume from orders
      const salesMap = new Map<string, number>();
      for (const order of orders) {
        if (!Array.isArray(order.items)) continue;
        for (const item of order.items as { id?: string; perfume_id?: string; quantity?: number }[]) {
          const pid = item.id ?? item.perfume_id;
          if (pid) salesMap.set(pid, (salesMap.get(pid) ?? 0) + (item.quantity ?? 1));
        }
      }

      const ranked = perfs
        .map((p) => ({ ...p, total_sold: salesMap.get(p.id) ?? 0 }))
        .sort((a, b) => {
          // Admin-pinned bestsellers always rank first
          if (a.is_bestseller && !b.is_bestseller) return -1;
          if (!a.is_bestseller && b.is_bestseller) return 1;
          return b.total_sold - a.total_sold;
        });

      setPerfumes(ranked);
      setCategories(catsRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "";

  const RANK_ICONS = [Award, Flame, TrendingUp];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.85 0.12 85 / 0.22), transparent 70%)" }} />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            Most Loved
          </div>
          <h1 className="font-display text-5xl font-semibold md:text-6xl">Bestsellers</h1>
          <p className="mt-4 mx-auto max-w-lg text-muted-foreground">
            The fragrances our customers return to, season after season. Ranked by total orders.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {perfumes.slice(0, 3).length > 0 && (
              <div className="mb-14">
                <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">Top 3</p>
                <div className="grid gap-6 md:grid-cols-3">
                  {perfumes.slice(0, 3).map((p, i) => {
                    const RankIcon = RANK_ICONS[i];
                    return (
                      <div key={p.id} className={`relative overflow-hidden rounded-3xl border bg-card ${i === 0 ? "md:order-2 ring-2" : i === 1 ? "md:order-1" : "md:order-3"}`}
                        style={{ borderColor: i === 0 ? "var(--accent)" : undefined, boxShadow: i === 0 ? "var(--shadow-elegant)" : "var(--shadow-soft)" }}>
                        {i === 0 && (
                          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: "var(--gradient-gold)" }} />
                        )}
                        <div className={`aspect-[4/3] overflow-hidden bg-muted ${i === 0 ? "aspect-[3/4]" : ""}`}>
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-10 w-10 text-primary/50" /></div>}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
                              <RankIcon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>#{i + 1} Bestseller</span>
                          </div>
                          <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                            <h3 className="font-display text-xl font-semibold hover:underline underline-offset-2">{p.name}</h3>
                          </Link>
                          {categoryName(p.category_id) && <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{categoryName(p.category_id)}</p>}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</span>
                            <Button size="sm" onClick={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added`); }} disabled={p.stock === 0} className="rounded-full gap-1.5 px-4">
                              <ShoppingCart className="h-3.5 w-3.5" /> Add
                            </Button>
                          </div>
                          {p.total_sold > 0 && <p className="mt-2 text-xs text-muted-foreground">{p.total_sold} sold</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rest */}
            {perfumes.slice(3).length > 0 && (
              <>
                <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">More Popular Picks</p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {perfumes.slice(3).map((p, i) => (
                    <article key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-8 w-8 text-primary/50" /></div>}
                        </Link>
                        <button onClick={() => toggle(p.id)} className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${has(p.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"} transition-colors`}>
                          <Heart className={`h-3.5 w-3.5 ${has(p.id) ? "fill-rose-500" : ""}`} />
                        </button>
                        <Badge className="absolute left-3 top-3 bg-muted/80 text-foreground border-0 text-[10px] backdrop-blur-sm">#{i + 4}</Badge>
                      </div>
                      <div className="p-4">
                        <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                          <h3 className="font-display text-base font-semibold hover:underline underline-offset-2">{p.name}</h3>
                        </Link>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</span>
                          <Button size="sm" variant="ghost" onClick={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added`); }} disabled={p.stock === 0} className="gap-1 px-3 h-8 rounded-full">
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {perfumes.length === 0 && (
              <div className="py-24 text-center">
                <p className="font-display text-2xl text-muted-foreground">No products yet</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
