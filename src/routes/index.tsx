import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Search, ShoppingBag, Lock } from "lucide-react";

type Category = { id: string; name: string };
type Perfume = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Aria — Curated Luxury Perfumes" },
      {
        name: "description",
        content:
          "Discover Maison Aria's collection of curated luxury fragrances. Browse perfumes by family and order your signature scent.",
      },
      { property: "og:title", content: "Maison Aria — Curated Luxury Perfumes" },
      {
        property: "og:description",
        content:
          "Discover Maison Aria's collection of curated luxury fragrances. Browse perfumes by family and order your signature scent.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [cats, perfs] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("perfumes")
          .select("id, name, description, price, stock, image_url, category_id")
          .order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      setCategories(cats.data ?? []);
      setPerfumes((perfs.data ?? []) as Perfume[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return perfumes.filter((p) => {
      const matchCat = activeCategory === "all" || p.category_id === activeCategory;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQuery;
    });
  }, [perfumes, activeCategory, query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Maison Aria
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">Admin</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, oklch(0.85 0.12 85 / 0.35), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              The Maison Aria Collection
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">
              Fragrances composed
              <span
                className="block"
                style={{
                  backgroundImage: "var(--gradient-gold)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                with quiet precision.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover a curated catalog of rare and refined perfumes — each one
              hand-selected for its character, longevity, and silage.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the collection…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              >
                All
              </CategoryChip>
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  active={activeCategory === c.id}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.name}
                </CategoryChip>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-16 text-center">
              <p className="font-display text-2xl">No fragrances found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or selecting another family.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PerfumeCard key={p.id} perfume={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Maison Aria · Crafted with care</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 opacity-60 transition-opacity hover:opacity-100"
            aria-label="Staff sign in"
          >
            <Lock className="h-3 w-3" />
            Staff
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PerfumeCard({ perfume }: { perfume: Perfume }) {
  const inStock = perfume.stock > 0;
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {perfume.image_url ? (
          <img
            src={perfume.image_url}
            alt={perfume.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Sparkles className="h-10 w-10 text-primary/70" />
          </div>
        )}
        {!inStock && (
          <Badge variant="secondary" className="absolute left-3 top-3">
            Sold out
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold">{perfume.name}</h3>
        {perfume.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {perfume.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span
            className="font-display text-lg font-semibold"
            style={{ color: "var(--accent)" }}
          >
            ${Number(perfume.price).toFixed(2)}
          </span>
          <Button asChild size="sm" disabled={!inStock}>
            <Link
              to="/order/$perfumeId"
              params={{ perfumeId: perfume.id }}
              disabled={!inStock}
            >
              <ShoppingBag className="h-4 w-4" />
              Order
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
