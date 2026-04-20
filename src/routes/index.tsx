import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Sparkles, Package, ShoppingBag, Tag } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <span className="font-display text-xl font-semibold tracking-tight">Maison Aria</span>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Button asChild variant="default">
                <Link to="/admin">Open Admin</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/login" search={{ mode: "signup" }}>
                    Create admin
                  </Link>
                </Button>
              </>
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
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              Perfume Atelier · Admin Suite
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">
              Curate your fragrance house
              <span className="block" style={{
                backgroundImage: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}>
                with quiet precision.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A clean, focused admin panel to manage your perfume catalog, organize categories,
              and track orders. The first account you create becomes the owner.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              {user ? (
                <Button asChild size="lg">
                  <Link to="/admin">{isAdmin ? "Enter admin panel" : "Open dashboard"}</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/login" search={{ mode: "signup" }}>
                      Claim your house
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
          {[
            { icon: Package, title: "Perfumes", body: "Catalog with images, pricing, stock and category." },
            { icon: Tag, title: "Categories", body: "Organize fragrances into curated families." },
            { icon: ShoppingBag, title: "Orders", body: "Capture customer orders and update status." },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Maison Aria · Crafted with care
      </footer>
    </div>
  );
}
