import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  LogOut,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin",             label: "Overview",   icon: LayoutDashboard, exact: true  },
  { to: "/admin/perfumes",    label: "Perfumes",   icon: Package,         exact: false },
  { to: "/admin/categories",  label: "Categories", icon: Tag,             exact: false },
  { to: "/admin/orders",      label: "Orders",     icon: ShoppingBag,     exact: false },
  { to: "/admin/vip-signups", label: "VIP List",   icon: Phone,           exact: false },
  { to: "/admin/contacts",    label: "Messages",   icon: Mail,            exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
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
        <div className="max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin permissions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={signOut} variant="outline">Sign out</Button>
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
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
          {/* Brand */}
          <div className="px-5 py-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-base font-semibold leading-tight">Maison Aria</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
            <p className="mb-2 px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Management
            </p>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {item.label === "Orders" && (
                    <span className="ml-auto" />
                  )}
                </Link>
              );
            })}

            <div className="mt-4 border-t border-sidebar-border pt-4">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Storefront
              </p>
              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                View Store
              </Link>
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-sidebar-border px-3 py-4">
            <div className="mb-2 flex items-center gap-3 px-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary"
                style={{ background: "var(--gradient-gold)" }}
              >
                {user.email?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{user.email}</p>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display text-base font-semibold">Maison Aria</span>
          </Link>
          <Button onClick={signOut} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-5 pb-28 pt-20 md:px-10 md:pt-10">
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
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] rounded-lg transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
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
