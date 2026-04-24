import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, LogOut, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type OrderItem = { id: string; name: string; price: number; quantity: number };
type Order = {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100  text-blue-700  border-blue-200",
  shipped:   "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100   text-red-700   border-red-200",
};

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "My Account — Maison Aria" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db: any = supabase;
      const { data } = await db.from("orders")
        .select("id, total_price, status, created_at, items")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoadingOrders(false);
    })();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    toast.success("You've been signed out.");
  }

  const initials = user?.email?.[0].toUpperCase() ?? "?";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* Profile card */}
      <div
        className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-center gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-bold text-primary"
            style={{ background: "var(--gradient-gold)" }}
          >
            {initials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">My Account</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            {memberSince && (
              <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="rounded-full gap-2 h-9 text-sm">
            <Link to="/collection">
              <ShoppingBag className="h-4 w-4" /> Browse Store
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2 h-9 text-sm text-destructive hover:text-destructive hover:border-destructive/40"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Order history */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Order History</h2>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Sparkles className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-display text-xl font-semibold">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order history will appear here after you place your first order.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full px-8"
              style={{ background: "var(--gradient-luxe)" }}
            >
              <Link to="/collection">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-6"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-display text-xl font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      AED {Number(order.total_price).toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(order.items ?? []).reduce((s, i) => s + i.quantity, 0)} item(s)
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(order.items ?? []).map((item, i) => (
                    <Link
                      key={i}
                      to="/order/$perfumeId"
                      params={{ perfumeId: item.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-muted-foreground" />
                      {item.name} ×{item.quantity}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Questions about this order?
                  </p>
                  <a
                    href={`https://wa.me/971569270365?text=${encodeURIComponent(`Hi! I have a question about my order #${order.id.slice(0, 8).toUpperCase()}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#25D366] hover:underline underline-offset-2"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
