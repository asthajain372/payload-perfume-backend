import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Perfume = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
};

export const Route = createFileRoute("/order/$perfumeId")({
  head: () => ({
    meta: [
      { title: "Place an order — Maison Aria" },
      { name: "description", content: "Order your selected fragrance from Maison Aria." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { perfumeId } = Route.useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", quantity: 1 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("perfumes")
        .select("id, name, description, price, stock, image_url")
        .eq("id", perfumeId)
        .maybeSingle();
      setPerfume(data as Perfume | null);
      setLoading(false);
    })();
  }, [perfumeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfume) return;
    if (!form.customer_name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    if (form.quantity < 1 || form.quantity > perfume.stock) {
      toast.error(`Quantity must be between 1 and ${perfume.stock}.`);
      return;
    }
    setSubmitting(true);
    const total = Number(perfume.price) * form.quantity;
    const { error } = await supabase.from("orders").insert({
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      total_price: total,
      items: [
        {
          perfume_id: perfume.id,
          name: perfume.name,
          unit_price: Number(perfume.price),
          quantity: form.quantity,
        },
      ],
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-display text-2xl">Fragrance not found</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-semibold">Order received</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you, {form.customer_name}. We'll call you at {form.phone} shortly to
            confirm the details of your {perfume.name}.
          </p>
          <Button asChild className="mt-8">
            <Link to="/">Continue browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  const total = Number(perfume.price) * form.quantity;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to collection
          </Link>
        </Button>

        <div className="grid gap-10 md:grid-cols-2">
          <div
            className="overflow-hidden rounded-xl border border-border bg-card"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="aspect-[4/5] bg-muted">
              {perfume.image_url ? (
                <img
                  src={perfume.image_url}
                  alt={perfume.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <Sparkles className="h-12 w-12 text-primary/70" />
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl font-semibold">{perfume.name}</h1>
            {perfume.description && (
              <p className="mt-3 text-muted-foreground">{perfume.description}</p>
            )}
            <p
              className="mt-4 font-display text-2xl font-semibold"
              style={{ color: "var(--accent)" }}
            >
              ${Number(perfume.price).toFixed(2)}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full name</Label>
                <Input
                  id="customer_name"
                  required
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={perfume.stock}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) || 1 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {perfume.stock} available
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span
                  className="font-display text-xl font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting || perfume.stock === 0}
              >
                {submitting
                  ? "Placing order…"
                  : perfume.stock === 0
                  ? "Sold out"
                  : "Place order"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We'll contact you by phone to confirm payment and delivery.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <span className="font-display text-xl font-semibold tracking-tight">
            Maison Aria
          </span>
        </Link>
      </div>
    </header>
  );
}
