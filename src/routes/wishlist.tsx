import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { Sparkles, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — JD09 Perfumes" }] }),
  component: WishlistPage,
});

type Perfume = { id: string; name: string; description: string | null; price: number; stock: number; image_url: string | null };

function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.size === 0) { setLoading(false); return; }
    supabase.from("perfumes").select("id,name,description,price,stock,image_url").in("id", [...ids])
      .then(({ data }) => { setPerfumes((data ?? []) as Perfume[]); setLoading(false); });
  }, [ids]);

  const visible = perfumes.filter((p) => ids.has(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Saved</p>
            <h1 className="font-display text-4xl font-semibold">Wishlist</h1>
          </div>
          {visible.length > 0 && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{visible.length} {visible.length === 1 ? "item" : "items"}</p>
              <Button
                size="sm"
                className="rounded-full gap-2 px-4"
                style={{ background: "var(--gradient-luxe)" }}
                onClick={() => {
                  visible.filter((p) => p.stock > 0).forEach((p) => addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }));
                  const inStock = visible.filter((p) => p.stock > 0).length;
                  if (inStock > 0) toast.success(`${inStock} item${inStock > 1 ? "s" : ""} added to cart`);
                  else toast.error("No items in stock to add");
                }}
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Add All to Cart
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
              <Heart className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <p className="font-display text-2xl font-semibold">Your wishlist is empty</p>
            <p className="mt-2 text-muted-foreground">Save fragrances you love by tapping the heart icon.</p>
            <Button asChild className="mt-8 rounded-full px-8" style={{ background: "var(--gradient-luxe)" }}>
              <Link to="/collection">Explore Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-10 w-10 text-primary/50" /></div>}
                  </Link>
                  <button onClick={() => toggle(p.id)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-rose-500 shadow-sm hover:bg-rose-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Link to="/order/$perfumeId" params={{ perfumeId: p.id }}>
                    <h3 className="font-display text-lg font-semibold hover:underline underline-offset-2">{p.name}</h3>
                  </Link>
                  {p.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(p.price))}</span>
                    <Button size="sm" disabled={p.stock === 0} className="gap-1.5 rounded-full px-4"
                      onClick={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added to cart`); }}>
                      <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
