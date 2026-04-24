import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X, Sparkles, Gift, Zap, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "maison-vip-seen";

const CODES = [
  { code: "+971", label: "🇦🇪 UAE" },
  { code: "+966", label: "🇸🇦 KSA" },
  { code: "+974", label: "🇶🇦 Qatar" },
  { code: "+965", label: "🇰🇼 Kuwait" },
  { code: "+973", label: "🇧🇭 Bahrain" },
  { code: "+968", label: "🇴🇲 Oman" },
  { code: "+44",  label: "🇬🇧 UK" },
  { code: "+1",   label: "🇺🇸 USA" },
  { code: "+33",  label: "🇫🇷 France" },
];

const PERKS = [
  { icon: Gift,     text: "Early access to new arrivals" },
  { icon: Zap,      text: "Exclusive member-only discounts" },
  { icon: Star,     text: "VIP offers & free gift surprises" },
];

export function VIPModal() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("+971");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Hide on admin/auth pages
  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/login");

  useEffect(() => {
    if (hidden) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, [hidden]);

  function dismiss() {
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    const { error } = await db.from("vip_signups").insert({
      phone: `${code}${cleaned}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save your number. Please try again.");
      return;
    }
    setDone(true);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setOpen(false), 2600);
  }

  if (!open || hidden) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "var(--gradient-luxe)" }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground/60 hover:bg-white/20 hover:text-primary-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[1fr_1fr]">
          {/* ── LEFT: form ── */}
          <div className="flex flex-col justify-center p-8 md:p-10">
            {/* Badge */}
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs uppercase tracking-widest text-primary-foreground/70">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "oklch(0.85 0.12 85)" }} />
              VIP Members
            </div>

            {done ? (
              /* Success state */
              <div className="flex flex-col items-start gap-4 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className="font-display text-3xl font-semibold text-primary-foreground leading-tight">
                  You're in!
                </h2>
                <p className="text-primary-foreground/60 text-sm leading-relaxed">
                  Welcome to the Maison Aria VIP list. Expect exclusive offers and early drops straight to your phone.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl font-semibold text-primary-foreground leading-tight md:text-4xl">
                  Join the
                  <span
                    className="block"
                    style={{
                      backgroundImage: "var(--gradient-gold)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    VIP List.
                  </span>
                </h2>
                <p className="mt-3 text-sm text-primary-foreground/60 leading-relaxed">
                  Be the first to know about new drops and exclusive member offers — delivered directly to your WhatsApp.
                </p>

                {/* Perks */}
                <ul className="mt-5 space-y-2.5">
                  {PERKS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/80">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "oklch(0.85 0.12 85 / 0.2)" }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: "oklch(0.85 0.12 85)" }} />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                  <div className="flex overflow-hidden rounded-xl border border-primary-foreground/20 bg-white/5 focus-within:border-primary-foreground/40 transition-colors">
                    <select
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="shrink-0 bg-transparent px-3 py-3 text-sm text-primary-foreground/80 focus:outline-none border-r border-primary-foreground/20"
                    >
                      {CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-background text-foreground">
                          {c.label} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile number"
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2 border-0"
                    style={{ background: "var(--gradient-gold)", color: "var(--primary)" }}
                  >
                    {submitting ? "Joining…" : "Join Now — It's Free"}
                  </Button>
                </form>

                <button
                  onClick={dismiss}
                  className="mt-4 text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors underline underline-offset-2"
                >
                  No thanks, I'll miss out
                </button>

                <p className="mt-3 text-[10px] text-primary-foreground/25 leading-relaxed">
                  By joining you agree to receive WhatsApp messages about offers and new arrivals from Maison Aria.
                  You can opt out at any time by replying STOP.
                </p>
              </>
            )}
          </div>

          {/* ── RIGHT: decorative ── */}
          <div
            className="relative hidden md:flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "oklch(0.14 0.025 60 / 0.5)" }}
          >
            {/* Concentric rings */}
            <div
              className="absolute h-80 w-80 rounded-full border opacity-[0.07]"
              style={{ borderColor: "oklch(0.85 0.12 85)" }}
            />
            <div
              className="absolute h-56 w-56 rounded-full border opacity-[0.12]"
              style={{ borderColor: "oklch(0.85 0.12 85)" }}
            />
            <div
              className="absolute h-32 w-32 rounded-full opacity-20"
              style={{ background: "var(--gradient-gold)" }}
            />

            {/* Center icon + stats */}
            <div className="relative z-10 flex flex-col items-center text-center px-8 gap-6">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Sparkles className="h-9 w-9 text-primary" />
              </div>

              <div>
                <p
                  className="font-display text-5xl font-semibold"
                  style={{ backgroundImage: "var(--gradient-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  5,000+
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-primary-foreground/50">
                  VIP Members
                </p>
              </div>

              <div className="space-y-2 w-full">
                {["Early drops", "Private sales", "Free gifts"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-primary-foreground/70"
                    style={{ background: "oklch(0.85 0.12 85 / 0.08)" }}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "oklch(0.85 0.12 85)" }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
