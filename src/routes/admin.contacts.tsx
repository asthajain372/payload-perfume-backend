import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Search, MessageSquare, ChevronDown, ChevronUp,
  Calendar, User, AtSign, X, Inbox,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contacts")({
  component: ContactsPage,
});

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db: any = supabase;
      const { data, error } = await db
        .from("contacts")
        .select("id, name, email, subject, message, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error("Failed to load messages");
      setContacts((data ?? []) as Contact[]);
      setLoading(false);
    })();
  }, []);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const todayCount = contacts.filter((c) => new Date(c.created_at) >= today).length;

  const filtered = contacts.filter((c) => {
    const q = query.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.subject ?? "").toLowerCase().includes(q);
  });

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  const fmtFull = (d: string) =>
    new Date(d).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Contact Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages submitted via the contact form on your storefront.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <span className="font-display text-xl font-semibold">{contacts.length}</span>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
          {todayCount > 0 && (
            <Badge className="rounded-full bg-primary text-primary-foreground border-0 px-3 py-1">
              {todayCount} new today
            </Badge>
          )}
        </div>
      </div>

      {/* Main layout: list + detail panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── LIST ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          {/* search bar */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email or subject…"
                className="pl-9 h-9"
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "message" : "messages"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">
                {contacts.length === 0 ? "No messages yet" : "No results match your search"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((c) => {
                const isOpen = expanded === c.id;
                const isSelected = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                  >
                    {/* Row summary */}
                    <div
                      className="flex cursor-pointer items-start gap-4 px-5 py-4"
                      onClick={() => {
                        setSelected(isSelected ? null : c);
                        setExpanded(isOpen ? null : c.id);
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-xs text-primary"
                        style={{ background: "var(--gradient-gold)" }}
                      >
                        {c.name[0]?.toUpperCase() ?? "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.email}</span>
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{fmt(c.created_at)}</span>
                        </div>
                        {c.subject && (
                          <p className="mt-0.5 text-sm font-medium text-foreground/80 truncate">{c.subject}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                      </div>

                      {isOpen
                        ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                        : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />}
                    </div>

                    {/* Inline expanded message (mobile / no side panel) */}
                    {isOpen && (
                      <div className="lg:hidden border-t border-border/60 bg-muted/20 px-5 py-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.message}</p>
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject ?? "Your message")}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> Reply by email
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── DETAIL PANEL (desktop) ── */}
        <div className="hidden lg:block">
          {selected ? (
            <div
              className="sticky top-10 rounded-2xl border border-border bg-card overflow-hidden"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <p className="font-semibold">Message detail</p>
                <button
                  onClick={() => { setSelected(null); setExpanded(null); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Sender info */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display font-bold text-lg text-primary"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    {selected.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  {[
                    { icon: User,     label: "Name",    value: selected.name },
                    { icon: AtSign,   label: "Email",   value: selected.email },
                    { icon: MessageSquare, label: "Subject", value: selected.subject ?? "—" },
                    { icon: Calendar, label: "Date",    value: fmtFull(selected.created_at) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="font-medium text-xs truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message body */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Message</p>
                  <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {selected.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 rounded-xl gap-2"
                    style={{ background: "var(--gradient-luxe)" }}
                  >
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "Your message")}&body=${encodeURIComponent(`Hi ${selected.name},\n\n`)}`}>
                      <Mail className="h-4 w-4" /> Reply by Email
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl gap-2"
                  >
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hi ${selected.name}, thank you for contacting Maison Aria!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="sticky top-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center"
            >
              <Mail className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Select a message to read it</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Click any row on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
