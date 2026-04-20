import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingBag, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({
    perfumes: 0,
    categories: 0,
    orders: 0,
    pending: 0,
  });

  useEffect(() => {
    (async () => {
      const [p, c, o, pend] = await Promise.all([
        supabase.from("perfumes").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        perfumes: p.count ?? 0,
        categories: c.count ?? 0,
        orders: o.count ?? 0,
        pending: pend.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Perfumes", value: stats.perfumes, icon: Package },
    { label: "Categories", value: stats.categories, icon: Tag },
    { label: "Orders", value: stats.orders, icon: ShoppingBag },
    { label: "Pending orders", value: stats.pending, icon: TrendingUp },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">A snapshot of your fragrance house.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} style={{ boxShadow: "var(--shadow-soft)" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl font-semibold">{c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
