import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles, ShoppingCart, MessageCircle,
  Minus, Plus, Star, Truck, Shield, RefreshCw, Check,
  Heart, Share2, Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "971555819416";

type Perfume = {
  id: string; name: string; brand: string | null; description: string | null;
  price: number; stock: number; image_url: string | null;
  category_id: string | null;
};
type Category = { id: string; name: string };

// Fragrance notes per category family
const NOTES_MAP: Record<string, { top: string; heart: string; base: string }> = {
  Floral:    { top: "Bergamot · Neroli · Aldehydes",   heart: "Rose · Jasmine · Peony",        base: "White Musk · Sandalwood · Amber" },
  Woody:     { top: "Cardamom · Black Pepper · Ginger", heart: "Cedar · Vetiver · Guaiac Wood", base: "Oud · Amber · Labdanum" },
  Oriental:  { top: "Saffron · Cinnamon · Cardamom",   heart: "Rose · Incense · Myrrh",        base: "Oud · Amber · Benzoin · Musk" },
  Fresh:     { top: "Sea Salt · Lemon · Mint",          heart: "Aquatic Notes · White Tea",     base: "Driftwood · White Musk · Ambergris" },
  Citrus:    { top: "Bergamot · Lemon · Grapefruit",   heart: "Neroli · Petitgrain · Jasmine",  base: "Cedarwood · Vetiver · Musk" },
  Gourmand:  { top: "Praline · Caramel · Coffee",       heart: "Vanilla · Tonka Bean · Cocoa",  base: "Amber · Sandalwood · Benzoin" },
};
const DEFAULT_NOTES = { top: "Bergamot · Cardamom · Pink Pepper", heart: "Rose · Jasmine · Iris", base: "Sandalwood · Amber · Musk" };

export const Route = createFileRoute("/order/$perfumeId")({
  head: () => ({
    meta: [
      { title: "Product — JD09 Perfumes" },
      { name: "description", content: "Order your selected fragrance from JD09 Perfumes." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { perfumeId } = Route.useParams();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { formatPrice, formatTotal } = useCurrency();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setPerfume(null);
    setCategory(null);
    setRelated([]);
    setQty(1);

    (async () => {
      const { data } = await supabase
        .from("perfumes")
        .select("id, name, brand, description, price, stock, image_url, category_id")
        .eq("id", perfumeId)
        .maybeSingle();

      if (!data) { setLoading(false); return; }
      const p = data as Perfume;
      setPerfume(p);

      // Load category + related in parallel
      const [catRes, relRes] = await Promise.all([
        p.category_id
          ? supabase.from("categories").select("id,name").eq("id", p.category_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("perfumes")
          .select("id,name,description,price,stock,image_url,category_id")
          .neq("id", perfumeId)
          .eq("category_id", p.category_id ?? "")
          .limit(4),
      ]);

      setCategory(catRes.data as Category | null);

      let relData = (relRes.data ?? []) as Perfume[];

      // If fewer than 4 same-category, fill with other products
      if (relData.length < 4) {
        const { data: extra } = await supabase
          .from("perfumes")
          .select("id,name,description,price,stock,image_url,category_id")
          .neq("id", perfumeId)
          .not("id", "in", `(${relData.map((r) => r.id).join(",") || perfumeId})`)
          .limit(4 - relData.length);
        relData = [...relData, ...((extra ?? []) as Perfume[])];
      }

      setRelated(relData.slice(0, 4));
      setLoading(false);
    })();
  }, [perfumeId]);

  function handleAddToCart() {
    if (!perfume) return;
    addItem({ id: perfume.id, name: perfume.name, price: Number(perfume.price), image_url: perfume.image_url }, qty);
    setAdded(true);
    toast.success(`${perfume.name} added to cart`, { description: `Qty: ${qty}` });
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!perfume) return;
    const msg = encodeURIComponent(
      `Hello! 👋 I'd like to enquire about *${perfume.name}* from JD09 Perfumes.\n\n` +
      `💰 Price: AED ${Number(perfume.price).toFixed(2)}\n` +
      `🔢 Quantity: ${qty}\n` +
      `💵 Estimated Total: AED ${(Number(perfume.price) * qty).toFixed(2)}\n\n` +
      `Could you please confirm availability and delivery details? Thank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  }

  function handleShare() {
    if (navigator.share && perfume) {
      navigator.share({ title: perfume.name, text: perfume.description ?? "", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
          <div className="space-y-5 pt-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="font-display text-3xl font-semibold">Fragrance not found</p>
          <p className="mt-2 text-muted-foreground">This scent may no longer be available.</p>
          <Button asChild className="mt-8 rounded-full px-8" style={{ background: "var(--gradient-luxe)" }}>
            <Link to="/collection">Back to Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inStock = perfume.stock > 0;
  const notes = NOTES_MAP[category?.name ?? ""] ?? DEFAULT_NOTES;
  const wishlisted = has(perfume.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-foreground transition-colors">Collection</Link>
          {category && (
            <>
              <span>/</span>
              <Link to="/collection" search={{ category: category.id }} className="hover:text-foreground transition-colors">{category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-[160px]">{perfume.name}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          {/* ── IMAGE ── */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-muted" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <div className="aspect-[4/5]">
                {perfume.image_url
                  ? <img src={perfume.image_url} alt={perfume.name} className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-20 w-20 text-primary/40" /></div>}
              </div>
            </div>
            {/* status badge */}
            <div className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${inStock ? "text-primary" : "bg-black/70 text-white"}`}
              style={inStock ? { background: "var(--gradient-gold)" } : {}}>
              <Check className="h-3 w-3" />
              {inStock ? "In Stock" : "Sold Out"}
            </div>
            {/* wishlist + share floaters */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button onClick={() => toggle(perfume.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow transition-colors ${wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500" : ""}`} />
              </button>
              <button onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── INFO ── */}
          <div className="flex flex-col py-2">
            {/* category + brand + stars */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {category && (
                <Link to="/collection" search={{ category: category.id }}>
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary/40 transition-colors">
                    {category.name}
                  </span>
                </Link>
              )}
              {perfume.brand && (
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {perfume.brand}
                </span>
              )}
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1.5 text-xs text-muted-foreground">(48 reviews)</span>
              </div>
            </div>

            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight">{perfume.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold" style={{ color: "var(--accent)" }}>
                {formatPrice(Number(perfume.price))}
              </span>
              <span className="text-sm text-muted-foreground">per bottle · 50 ml EDP</span>
            </div>

            {perfume.description && (
              <p className="mt-5 text-base leading-relaxed text-muted-foreground border-l-2 border-border pl-4">
                {perfume.description}
              </p>
            )}

            {/* stock */}
            <div className="mt-5 flex items-center gap-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className="text-muted-foreground">
                {inStock ? `${perfume.stock} units available` : "Currently out of stock"}
              </span>
            </div>

            {/* qty */}
            {inStock && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">Quantity</p>
                <div className="inline-flex items-center rounded-xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-display text-lg font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(perfume.stock, q + 1))}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* total */}
            {inStock && qty > 1 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>{formatTotal(Number(perfume.price) * qty, qty)}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={handleAddToCart} disabled={!inStock}
                className="flex-1 h-12 rounded-full gap-2 text-base" variant="outline"
                style={added ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}>
                {added ? <><Check className="h-5 w-5" /> Added!</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
              </Button>
              <Button size="lg" onClick={handleBuyNow} disabled={!inStock}
                className="flex-1 h-12 rounded-full gap-2 text-base bg-[#25D366] hover:bg-[#20ba59] text-white border-0">
                <MessageCircle className="h-5 w-5" /> Buy on WhatsApp
              </Button>
            </div>

            {/* trust badges */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Delivery", sub: "Orders over AED 150" },
                { icon: Shield, label: "100% Authentic", sub: "Genuine fragrance" },
                { icon: RefreshCw, label: "Easy Returns", sub: "Within 7 days" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/60 p-3 text-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS: NOTES / DETAILS / HOW TO USE ── */}
        <div className="mt-16">
          <Tabs notes={notes} />
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {category ? `More from ${category.name}` : "You may also like"}
                </p>
                <h2 className="font-display text-3xl font-semibold">Related Fragrances</h2>
              </div>
              <Link to="/collection" search={category ? { category: category.id } : {}}
                className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <RelatedCard key={p.id} perfume={p}
                  wishlisted={has(p.id)}
                  onWishlist={() => toggle(p.id)}
                  onAddCart={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added to cart`); }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── COMPLETE THE RITUAL ── */}
        <div className="mt-20 rounded-3xl border border-border overflow-hidden" style={{ background: "var(--gradient-luxe)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-3">Complete the ritual</p>
              <h2 className="font-display text-3xl font-semibold text-primary-foreground">Gift wrapping available</h2>
              <p className="mt-3 text-primary-foreground/70 leading-relaxed">
                Every JD09 Perfumes order ships in our signature matte black box, sealed with a wax stamp.
                Add a personalised message at checkout via WhatsApp.
              </p>
              <Button onClick={handleBuyNow} className="mt-7 w-fit h-11 rounded-full px-7 gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white border-0">
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </Button>
            </div>
            <div className="hidden md:flex items-center justify-center p-10" style={{ background: "oklch(0.18 0.02 60 / 0.3)" }}>
              <Package className="h-24 w-24 text-primary-foreground/20" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── TABS COMPONENT ──
function Tabs({ notes }: { notes: { top: string; heart: string; base: string } }) {
  const [tab, setTab] = useState<"notes" | "details" | "howto">("notes");
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
      {/* tab bar */}
      <div className="flex border-b border-border">
        {(["notes", "details", "howto"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${tab === t ? "border-b-2 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={tab === t ? { borderBottomColor: "var(--accent)" } : {}}>
            {t === "notes" ? "Fragrance Notes" : t === "details" ? "Details" : "How to Wear"}
          </button>
        ))}
      </div>

      <div className="p-8 md:p-12">
        {tab === "notes" && (
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { tier: "Top Notes", value: notes.top, desc: "First impression · lasts 15–30 min" },
              { tier: "Heart Notes", value: notes.heart, desc: "The soul · emerges after 30 min" },
              { tier: "Base Notes", value: notes.base, desc: "The lasting trail · hours on skin" },
            ].map(({ tier, value, desc }) => (
              <div key={tier} className="relative pl-5 border-l-2 border-border">
                <div className="absolute -left-[7px] top-0 h-3.5 w-3.5 rounded-full" style={{ background: "var(--gradient-gold)" }} />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{tier}</p>
                <p className="font-display text-base font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "details" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Volume", "50 ml Eau de Parfum"],
              ["Concentration", "EDP — 15–20% aromatic compounds"],
              ["Longevity", "8–14 hours on skin"],
              ["Sillage", "Moderate to strong"],
              ["Season", "All seasons · especially Autumn & Winter"],
              ["Occasion", "Evening · Date night · Special events"],
              ["Gender", "Unisex"],
              ["Origin", "Grasse, France"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "howto" && (
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Apply to pulse points", desc: "Wrists, neck, inner elbows — where your skin is warmest. Heat amplifies the fragrance." },
              { step: "02", title: "Don't rub", desc: "Press the bottle against your skin and let it rest. Rubbing crushes the top notes and shortens longevity." },
              { step: "03", title: "Layer for depth", desc: "Apply right after your shower on moisturised skin. Hydrated skin holds fragrance longer and more richly." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="font-display text-5xl font-semibold opacity-10 mb-3">{step}</div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RELATED CARD ──
function RelatedCard({ perfume, wishlisted, onWishlist, onAddCart }: {
  perfume: Perfume; wishlisted: boolean; onWishlist: () => void; onAddCart: () => void;
}) {
  const inStock = perfume.stock > 0;
  const { formatPrice } = useCurrency();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }}>
          {perfume.image_url
            ? <img src={perfume.image_url} alt={perfume.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-10 w-10 text-primary/50" /></div>}
        </Link>
        <button onClick={onWishlist}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500" : ""}`} />
        </button>
        {!inStock && <Badge className="absolute left-3 top-3 bg-black/70 text-white border-0 backdrop-blur-sm text-[10px]">Sold Out</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }}>
          <h3 className="font-display text-base font-semibold leading-tight hover:underline underline-offset-2">{perfume.name}</h3>
        </Link>
        {perfume.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{perfume.description}</p>}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(perfume.price))}</span>
          <Button size="sm" onClick={onAddCart} disabled={!inStock} className="gap-1.5 rounded-full px-3 h-8">
            <ShoppingCart className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}
