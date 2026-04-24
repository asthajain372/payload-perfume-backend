import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, ShoppingBag, Clock, DollarSign, TrendingUp, ArrowRight, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface RecentOrder {
  id: string;
  customer_name: string;
  phone: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

function AdminOverview() {
  const [stats, setStats] = useState({
    perfumes: 0,
    categories: 0,
    orders: 0,
    pending: 0,
    revenue: 0,
    todayRevenue: 0,
  });
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [p, c, o, pend, allOrders, recentOrders] = await Promise.all([
        supabase.from("perfumes").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total_price, created_at").neq("status", "cancelled"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
      ]);

      const revenue = (allOrders.data ?? []).reduce(
        (sum: number, r: { total_price: number }) => sum + Number(r.total_price),
        0,
      );
      const todayRevenue = (allOrders.data ?? [])
        .filter((r: { created_at: string }) => new Date(r.created_at) >= today)
        .reduce((sum: number, r: { total_price: number }) => sum + Number(r.total_price), 0);

      setStats({
        perfumes: p.count ?? 0,
        categories: c.count ?? 0,
        orders: o.count ?? 0,
        pending: pend.count ?? 0,
        revenue,
        todayRevenue,
      });
      setRecent((recentOrders.data ?? []) as RecentOrder[]);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: `AED ${stats.revenue.toFixed(2)}`,
      sub: `AED ${stats.todayRevenue.toFixed(2)} today`,
      icon: DollarSign,
      accent: true,
    },
    { label: "Total Orders", value: stats.orders, sub: `${stats.pending} pending`, icon: ShoppingBag, accent: false },
    { label: "Perfumes", value: stats.perfumes, sub: "in catalog", icon: Package, accent: false },
    { label: "Categories", value: stats.categories, sub: "fragrance families", icon: Tag, accent: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A live snapshot of your fragrance house.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="relative overflow-hidden"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              {c.accent && (
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{ background: "var(--gradient-gold)" }}
                />
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.accent ? "" : "bg-muted"}`}
                  style={c.accent ? { background: "var(--gradient-gold)" } : {}}
                >
                  <Icon className={`h-4 w-4 ${c.accent ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl font-semibold">{loading ? "—" : c.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* pending alert */}
      {stats.pending > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
          style={{ color: "oklch(0.45 0.12 75)" }}
        >
          <Clock className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {stats.pending} order{stats.pending > 1 ? "s" : ""} waiting for confirmation
            </p>
            <p className="text-xs text-amber-700">Review and update statuses to keep customers informed.</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors"
          >
            View orders <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div
          className="rounded-xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                  >
                    <td className="px-5 py-3.5 font-medium">{o.customer_name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{o.phone}</td>
                    <td className="px-5 py-3.5 text-right font-medium" style={{ color: "var(--accent)" }}>
                      AED {Number(o.total_price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={statusStyle[o.status]}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { to: "/admin/perfumes",    icon: Package,   label: "Perfumes",   desc: "Add, edit or remove fragrances" },
          { to: "/admin/categories",  icon: Tag,       label: "Categories", desc: "Organize fragrance families" },
          { to: "/admin/orders",      icon: TrendingUp,label: "Orders",     desc: "Track and fulfill orders" },
          { to: "/admin/vip-signups", icon: Phone,     label: "VIP List",   desc: "Phone numbers collected" },
          { to: "/admin/contacts",    icon: Mail,      label: "Messages",   desc: "Contact form submissions" },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
