import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings2, IndianRupee, Truck } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = supabase;

const SETTINGS_CACHE = "maison-aria-inr-settings";

function SettingsPage() {
  const [rate, setRate] = useState("23");
  const [courier, setCourier] = useState("250");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.from("settings")
      .select("key,value")
      .in("key", ["inr_exchange_rate", "inr_courier_charge"])
      .then(({ data }: { data: { key: string; value: string }[] | null }) => {
        if (data) {
          const r = data.find((s) => s.key === "inr_exchange_rate")?.value;
          const c = data.find((s) => s.key === "inr_courier_charge")?.value;
          if (r) setRate(r);
          if (c) setCourier(c);
        }
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const rateNum = Number(rate);
    const courierNum = Number(courier);
    if (!rateNum || rateNum <= 0) { toast.error("Exchange rate must be greater than 0"); return; }
    if (courierNum < 0) { toast.error("Courier charge cannot be negative"); return; }

    setSaving(true);
    const updates = [
      { key: "inr_exchange_rate", value: String(rateNum), updated_at: new Date().toISOString() },
      { key: "inr_courier_charge", value: String(courierNum), updated_at: new Date().toISOString() },
    ];

    const { error } = await db.from("settings").upsert(updates, { onConflict: "key" });
    setSaving(false);

    if (error) { toast.error(error.message); return; }

    // Bust the client-side settings cache so the storefront picks up new values
    localStorage.removeItem(SETTINGS_CACHE);
    localStorage.removeItem(`${SETTINGS_CACHE}-ts`);

    toast.success("Settings saved — storefront will update on next page load");
  }

  const exampleAed = 150;
  const exampleInr = Math.ceil(exampleAed * Number(rate || 0)) + Number(courier || 0);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure storefront behaviour and regional pricing.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">India (INR) Pricing</h2>
            <p className="text-xs text-muted-foreground">
              Indian visitors see prices in ₹. Each bottle's INR price = (AED × rate) + courier charge.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">
                  AED → INR Exchange Rate
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">(e.g. 23)</span>
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  required
                  placeholder="23"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courier">
                  Courier Charge per Bottle (₹)
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">(baked into price)</span>
                </Label>
                <div className="relative">
                  <Truck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="courier"
                    type="number"
                    step="1"
                    min="0"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    required
                    placeholder="250"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Preview: a perfume priced at AED {exampleAed} will show as
              </span>
              <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>
                ₹{isNaN(exampleInr) ? "—" : exampleInr.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Settings2 className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save Settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
