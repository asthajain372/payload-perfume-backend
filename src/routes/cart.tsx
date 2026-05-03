import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";
import {
  Sparkles, ShoppingCart, Trash2, Plus, Minus,
  ArrowLeft, ShoppingBag,
} from "lucide-react";

const WHATSAPP_NUMBER = "971555819416";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — JD09 Perfumes" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, count, total, removeItem, updateQty, clear } = useCart();
  const { formatTotal } = useCurrency();

  function handleWhatsAppEnquiry() {
    if (items.length === 0) return;
    const shipping = total >= 150 ? 0 : 15;
    const finalTotal = total + shipping;
    const lines = items
      .map((i) => `• ${i.name} ×${i.quantity} — AED ${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");
    const msg = encodeURIComponent(
      `Hello! 👋 I'd like to enquire about the following from *JD09 Perfumes*:\n\n${lines}\n\n` +
      `💰 *Estimated Total: AED ${finalTotal.toFixed(2)}*\n\nCould you please confirm availability and delivery details? Thank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    clear();
    toast.success("WhatsApp opening — continue the conversation there!");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="border-b border-border/50 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">JD09 Perfumes</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>{count} {count === 1 ? "item" : "items"}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/collection" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="font-display text-4xl font-semibold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
              <ShoppingBag className="h-9 w-9 text-muted-foreground/50" />
            </div>
            <p className="font-display text-2xl font-semibold">Your cart is empty</p>
            <p className="mt-2 text-muted-foreground">Discover our collection and add your favourite scents.</p>
            <Button asChild className="mt-8 rounded-full px-8" style={{ background: "var(--gradient-luxe)" }}>
              <Link to="/">Explore Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* items list */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  {/* image */}
                  <Link to="/order/$perfumeId" params={{ perfumeId: item.id }} className="shrink-0">
                    <div className="h-24 w-20 overflow-hidden rounded-xl bg-muted">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}>
                          <Sparkles className="h-6 w-6 text-primary/50" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/order/$perfumeId" params={{ perfumeId: item.id }}>
                        <h3 className="font-display text-lg font-semibold leading-tight hover:underline underline-offset-2">
                          {item.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* qty */}
                      <div className="inline-flex items-center rounded-lg border border-border bg-background overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>
                        {formatTotal(item.price * item.quantity, item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear cart
              </button>
            </div>

            {/* order summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="overflow-hidden rounded-2xl border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>

                {/* ── Header ── */}
                <div className="px-6 py-5 flex items-center gap-3" style={{ background: "var(--gradient-luxe)" }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-primary-foreground leading-tight">Enquiry Summary</p>
                    <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50">JD09 Perfumes</p>
                  </div>
                  <span className="ml-auto rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground/80">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="bg-card p-6 space-y-5">
                  {/* ── Item rows with thumbnail ── */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            : <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Sparkles className="h-3 w-3 text-primary/50" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">{formatTotal(item.price * item.quantity, item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Free shipping progress ── */}
                  {total < 150 ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Free shipping at AED 150</span>
                        <span className="font-medium text-foreground">AED {(150 - total).toFixed(2)} away</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((total / 150) * 100, 100)}%`, background: "var(--gradient-gold)" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                      </div>
                      Free shipping unlocked on your order!
                    </div>
                  )}

                  {/* ── Price breakdown ── */}
                  <div className="space-y-2.5 text-sm border-t border-border pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">{formatTotal(total, count)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={total >= 150 ? "font-semibold text-emerald-600" : "font-medium text-foreground"}>
                        {total >= 150 ? "Free" : "AED 15"}
                      </span>
                    </div>
                  </div>

                  {/* ── Total ── */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3.5"
                    style={{ background: "oklch(0.97 0.04 85 / 0.6)", border: "1px solid oklch(0.85 0.12 85 / 0.3)" }}
                  >
                    <span className="font-display text-base font-semibold">Total</span>
                    <span className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
                      {formatTotal(total >= 150 ? total : total + 15, count)}
                    </span>
                  </div>

                  {/* ── CTA ── */}
                  <Button
                    size="lg"
                    onClick={handleWhatsAppEnquiry}
                    className="w-full h-12 rounded-xl gap-2.5 text-base font-semibold border-0 text-white"
                    style={{ background: "linear-gradient(135deg, #25D366 0%, #20ba59 100%)", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Checkout via WhatsApp
                  </Button>

                  {/* ── Trust row ── */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { emoji: "🔒", label: "Secure" },
                      { emoji: "✅", label: "Authentic" },
                      { emoji: "📦", label: "Gift Packed" },
                    ].map(({ emoji, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 py-2.5">
                        <span className="text-base leading-none">{emoji}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
                    We'll confirm your order &amp; arrange delivery via WhatsApp within minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
