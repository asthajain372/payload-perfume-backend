import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Search, SlidersHorizontal, Heart, ShoppingCart, Sparkles, LayoutGrid, List, ChevronDown, Check, X } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "Collection — JD09 Perfumes" }] }),
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
  const [activeCategories, setActiveCategories] = useState<string[]>(initCat ? [initCat] : []);
  const [activeBrands, setActiveBrands] = useState<string[]>(initBrand ? [initBrand] : []);
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

  const brands = useMemo(
    () => [...new Set(perfumes.map((p) => p.brand).filter(Boolean) as string[])].sort(),
    [perfumes],
  );

  const filtered = useMemo(() => {
    let list = perfumes.filter((p) => {
      const matchCat = activeCategories.length === 0 || activeCategories.includes(p.category_id ?? "");
      const matchBrand = activeBrands.length === 0 || activeBrands.includes(p.brand ?? "");
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false);
      const matchPrice = Number(p.price) <= priceMax;
      return matchCat && matchBrand && matchQ && matchPrice;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [perfumes, activeCategories, activeBrands, query, sort, priceMax]);

  const isNew = (created_at: string) => Date.now() - new Date(created_at).getTime() < 30 * 86400000;

  const hasFilters = activeCategories.length > 0 || activeBrands.length > 0 || query.trim() !== "" || priceMax < maxPrice;
  const clearAll = () => { setActiveCategories([]); setActiveBrands([]); setQuery(""); setPriceMax(maxPrice); };

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
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-20 -mx-6 mb-8 px-6 pt-3 pb-0 bg-background/95 backdrop-blur-md border-b border-border">
          {/* Single row: search | filters | sort + view */}
          <div className="flex items-center gap-2 pb-3 flex-wrap">
            {/* Search */}
            <div className="relative shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-9 h-9 w-40" />
            </div>

            {/* Vertical divider */}
            <div className="h-6 w-px bg-border shrink-0" />

            {/* Filter icon + dropdowns */}
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <FilterCombobox
              placeholder="Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={activeCategories}
              onChange={setActiveCategories}
            />
            {!loading && brands.length > 0 && (
              <FilterCombobox
                placeholder="Brand"
                options={brands.map((b) => ({ value: b, label: b }))}
                value={activeBrands}
                onChange={setActiveBrands}
              />
            )}

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}

            {/* Push right */}
            <div className="flex-1 min-w-0" />

            {/* Price slider */}
            {!loading && maxPrice > 0 && (
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border bg-card px-3 h-9 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Price</span>
                <input
                  type="range" min={0} max={maxPrice} step={10} value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-20 accent-primary"
                />
                <span className="text-xs font-medium w-14 text-right" style={{ color: "var(--accent)" }}>
                  {priceMax >= maxPrice ? "Any" : `AED ${priceMax}`}
                </span>
              </div>
            )}

            {/* Sort */}
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground shrink-0">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex rounded-xl border border-border bg-card overflow-hidden shrink-0">
              <button onClick={() => setView("grid")} className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          {(activeCategories.length > 0 || activeBrands.length > 0) && (
            <div className="flex flex-wrap gap-2 pb-3">
              {activeCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                return cat ? (
                  <button
                    key={catId}
                    onClick={() => setActiveCategories((prev) => prev.filter((x) => x !== catId))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {cat.name}
                    <X className="h-3 w-3" />
                  </button>
                ) : null;
              })}
              {activeBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActiveBrands((prev) => prev.filter((x) => x !== brand))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {brand}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid / List */}
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
            <Button className="mt-6 rounded-full px-6" variant="outline" onClick={clearAll}>
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

// ── Multi-select searchable filter dropdown ──
function FilterCombobox({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filteredOpts = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const isActive = value.length > 0;
  const label = isActive
    ? value.length === 1
      ? (options.find((o) => o.value === value[0])?.label ?? placeholder)
      : `${value.length} selected`
    : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setSearch(""); }}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all
          ${isActive
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
      >
        <span className="max-w-[140px] truncate">{label}</span>
        {isActive && value.length > 1 && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-foreground/25 text-[10px] font-bold">
            {value.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-60 rounded-2xl border border-border bg-card shadow-2xl">
          {/* Search input */}
          <div className="p-2.5 border-b border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-xl bg-muted/60 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filteredOpts.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No results</p>
            ) : (
              filteredOpts.map((o) => {
                const isSelected = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors text-left
                      ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </span>
                    {o.label}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: clear this filter */}
          {value.length > 0 && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => { onChange([]); }}
                className="w-full rounded-xl py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
