import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Search, Copy, Check, TrendingUp, Users, CalendarDays, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vip-signups")({
  component: VIPSignupsPage,
});

type Signup = { id: string; phone: string; created_at: string };

function VIPSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db: any = supabase;
      const { data, error } = await db
        .from("vip_signups")
        .select("id, phone, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error("Failed to load signups");
      setSignups((data ?? []) as Signup[]);
      setLoading(false);
    })();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  const todayCount = signups.filter((s) => new Date(s.created_at) >= today).length;
  const weekCount  = signups.filter((s) => new Date(s.created_at) >= thisWeek).length;

  const filtered = signups.filter((s) =>
    !query.trim() || s.phone.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function copyAll() {
    const text = filtered.map((s) => s.phone).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${filtered.length} numbers copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCSV() {
    const rows = ["Phone,Joined"].concat(
      filtered.map((s) => `${s.phone},${new Date(s.created_at).toISOString()}`),
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "vip-signups.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">VIP List</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phone numbers collected from your site's VIP signup popup.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyAll} className="gap-2 rounded-lg">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            Copy All
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 rounded-lg">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Signups",  value: signups.length, icon: Users,        accent: true  },
          { label: "Joined Today",   value: todayCount,     icon: CalendarDays, accent: false },
          { label: "Last 7 Days",    value: weekCount,      icon: TrendingUp,   accent: false },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="relative flex items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card px-6 py-5"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            {accent && (
              <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ background: "var(--gradient-gold)" }} />
            )}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={accent ? { background: "var(--gradient-gold)" } : { background: "var(--muted)" }}
            >
              <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold">{loading ? "—" : value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
        {/* toolbar */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by phone…"
              className="pl-9 h-9"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Phone className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              {signups.length === 0 ? "No signups yet" : "No results match your search"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Phone Number</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date Joined</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20 ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="font-medium font-mono tracking-wide">{s.phone}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{fmt(s.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`https://wa.me/${s.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! Thank you for joining the JD09 Perfumes VIP list. 🌹")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 px-3 py-1.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Message
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
