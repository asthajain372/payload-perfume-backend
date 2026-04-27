import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { Search, SlidersHorizontal, Heart, ShoppingCart, Sparkles, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "Collection — Maison Aria" }] }),
  validateSearch: searchSchema,
  component: CollectionPage,
});

type Category = { id: string; name: string };
type Perfume = { id: string; name: string; brand: string | null; description: string | null; price: number; stock: number; image_url: string | null; category_id: string | null; created_at: string };

const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
] as const;
type SortKey = typeof SORTS[number]["value"];

function CollectionPage() {
  const { category: initCat, brand: initBrand, q: initQ } = Route.useSearch();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(initCat ?? "all");
  const [activeBrand, setActiveBrand] = useState<string>(initBrand ?? "all");
  const [query, setQuery] = useState(initQ ?? "");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [priceMax, setPriceMax] = useState<number>(9999);

  useEffect(() => {
    (async () => {
      const [cats, perfs] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("perfumes").select("id, name, brand, description, price, stock, image_url, category_id, created_at").order("created_at", { ascending: false }),
      ]);
      setCategories(cats.data ?? []);
      const data = (perfs.data ?? []) as Perfume[];
      setPerfumes(data);
      const max = Math.max(...data.map((p) => Number(p.price)), 500);
      setPriceMax(Math.ceil(max / 100) * 100);
      setLoading(false);
    })();
  }, []);

  const maxPrice = useMemo(() => Math.max(...perfumes.map((p) => Number(p.price)), 500), [perfumes]);

  // Unique brands that have at least one perfume
  const brands = useMemo(
    () => [...new Set(perfumes.map((p) => p.brand).filter(Boolean) as string[])].sort(),
    [perfumes],
  );

  const filtered = useMemo(() => {
    let list = perfumes.filter((p) => {
      const matchCat = activeCategory === "all" || p.category_id === activeCategory;
      const matchBrand = activeBrand === "all" || p.brand === activeBrand;
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false);
      const matchPrice = Number(p.price) <= priceMax;
      return matchCat && matchBrand && matchQ && matchPrice;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [perfumes, activeCategory, activeBrand, query, sort, priceMax]);

  const isNew = (created_at: string) => Date.now() - new Date(created_at).getTime() < 30 * 86400000;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="border-b border-border/50 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Browse</p>
          <h1 className="font-display text-4xl font-semibold">The Collection</h1>
          <p className="mt-2 text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} fragrances`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter bar */}
        <div className="mb-6 space-y-3">
          {/* Row 1: search + sort + view toggle */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fragrances…" className="pl-9 h-10 w-56" />
            </div>
            <div className="flex items-center gap-2">
              {/* Price slider */}
              {!loading && maxPrice > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 h-10">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Up to</span>
                  <input
                    type="range" min={0} max={maxPrice} step={10} value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-24 accent-primary"
                  />
                  <span className="text-xs font-medium w-20 text-right" style={{ color: "var(--accent)" }}>
                    {priceMax >= maxPrice ? "Any" : `AED ${priceMax}`}
                  </span>
                </div>
              )}
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="flex rounded-lg border border-border bg-card overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-2.5 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-2.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-16 shrink-0">Category</span>
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
              {["all", ...categories.map((c) => c.id)].map((id) => {
                const label = id === "all" ? "All" : categories.find((c) => c.id === id)?.name ?? id;
                return (
                  <button key={id} onClick={() => setActiveCategory(id)}
                    className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${activeCategory === id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Brand pills — only shown once brands exist */}
          {!loading && brands.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-16 shrink-0">Brand</span>
              <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
                {["all", ...brands].map((b) => (
                  <button key={b} onClick={() => setActiveBrand(b)}
                    className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${activeBrand === b ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                    {b === "all" ? "All" : b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <SlidersHorizontal className="mx-auto mb-4 h-8 w-8 text-muted-foreground/30" />
            <p className="font-display text-2xl">No fragrances match</p>
            <p className="mt-2 text-sm text-muted-foreground">Try changing your filters or search term.</p>
            <Button className="mt-6 rounded-full px-6" variant="outline" onClick={() => { setActiveCategory("all"); setActiveBrand("all"); setQuery(""); setPriceMax(maxPrice); }}>
              Clear filters
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} perfume={p} isNew={isNew(p.created_at)} onAddCart={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added to cart`); }} onWishlist={() => toggle(p.id)} wishlisted={has(p.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((p) => (
              <ProductRow key={p.id} perfume={p} isNew={isNew(p.created_at)} onAddCart={() => { addItem({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }); toast.success(`${p.name} added to cart`); }} onWishlist={() => toggle(p.id)} wishlisted={has(p.id)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function ProductCard({ perfume, isNew, onAddCart, onWishlist, wishlisted }: { perfume: Perfume; isNew: boolean; onAddCart: () => void; onWishlist: () => void; wishlisted: boolean }) {
  const inStock = perfume.stock > 0;
  const { formatPrice } = useCurrency();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }}>
          {perfume.image_url ? (
            <img src={perfume.image_url} alt={perfume.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}>
              <Sparkles className="h-10 w-10 text-primary/50" />
            </div>
          )}
        </Link>
        <button onClick={onWishlist} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors shadow-sm ${wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500" : ""}`} />
        </button>
        {isNew && <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground border-0">New</Badge>}
        {!inStock && <Badge className="absolute left-3 top-3 bg-black/70 text-white border-0 backdrop-blur-sm">Sold Out</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }}>
          <h3 className="font-display text-lg font-semibold leading-tight hover:underline underline-offset-2">{perfume.name}</h3>
        </Link>
        {perfume.brand && <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">{perfume.brand}</p>}
        {perfume.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">{perfume.description}</p>}
        {inStock && perfume.stock <= 5 && (
          <p className="mt-1.5 text-[10px] font-semibold text-rose-500 uppercase tracking-wide">Only {perfume.stock} left</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(perfume.price))}</span>
          <Button size="sm" onClick={onAddCart} disabled={!inStock} className="gap-1.5 rounded-full px-4">
            <ShoppingCart className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProductRow({ perfume, isNew, onAddCart, onWishlist, wishlisted }: { perfume: Perfume; isNew: boolean; onAddCart: () => void; onWishlist: () => void; wishlisted: boolean }) {
  const inStock = perfume.stock > 0;
  const { formatPrice } = useCurrency();
  return (
    <div className="flex gap-5 rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "var(--shadow-soft)" }}>
      <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }} className="shrink-0">
        <div className="h-28 w-24 overflow-hidden rounded-xl bg-muted">
          {perfume.image_url ? <img src={perfume.image_url} alt={perfume.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-6 w-6 text-primary/50" /></div>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {isNew && <Badge className="mb-1 bg-primary text-primary-foreground border-0 text-[10px]">New</Badge>}
            <Link to="/order/$perfumeId" params={{ perfumeId: perfume.id }}>
              <h3 className="font-display text-xl font-semibold hover:underline underline-offset-2">{perfume.name}</h3>
            </Link>
            {perfume.brand && <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{perfume.brand}</p>}
            {perfume.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{perfume.description}</p>}
          </div>
          <button onClick={onWishlist} className={`shrink-0 ${wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"} transition-colors`}>
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>{formatPrice(Number(perfume.price))}</span>
          <Button size="sm" onClick={onAddCart} disabled={!inStock} className="gap-2 rounded-full px-5">
            <ShoppingCart className="h-4 w-4" /> {inStock ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
