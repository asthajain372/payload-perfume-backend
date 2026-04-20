import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, Tag, ShoppingBag, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: Sparkles, exact: true },
  { to: "/admin/perfumes", label: "Perfumes", icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tag, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin permissions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={signOut} variant="outline">
              Sign out
            </Button>
            <Button asChild>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar px-4 py-6 md:flex md:flex-col">
          <Link to="/" className="mb-8 flex items-center gap-2 px-2">
            <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <span className="font-display text-lg font-semibold">Maison Aria</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border pt-4">
            <p className="truncate px-2 text-xs text-muted-foreground">{user.email}</p>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <span className="font-display text-base font-semibold">Maison Aria</span>
          </Link>
          <Button onClick={signOut} variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <main className="flex-1 px-4 pb-24 pt-16 md:px-10 md:pt-10">
          <Outlet />
          {/* Mobile bottom nav */}
          <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px]",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
