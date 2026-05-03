import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, CheckCircle2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — JD09 Perfumes" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    const { error } = await db.from("contacts").insert(parsed.data);
    setSubmitting(false);
    if (error) { toast.error("Couldn't send your message. Please try again."); return; }
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* minimal header */}
      <header className="border-b border-border/50 px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/logo.jpeg" alt="JD09 Perfumes" className="h-12 w-12 object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
          <span className="font-display text-xl font-semibold">JD09 Perfumes</span>
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            {/* left */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Get in touch</p>
              <h1 className="font-display text-4xl font-semibold leading-tight mb-4">Contact Us</h1>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Have a question about a fragrance, an order, or anything else?
                Our team typically responds within 24 hours.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "Phone / WhatsApp", value: "+971 55 581 9416" },
                  { icon: Phone, label: "Phone", value: "+971 54 236 1145" },
                  { icon: Phone, label: "Phone", value: "+971 50 263 5062" },
                  { icon: Mail, label: "Email", value: "darshanpujara82@gmail.com" },
                  { icon: MessageSquare, label: "Address", value: "Shop no -2, Taj Daulat Building, Near Arabian Courtyard Hotel, Opp Dubai Museum, Meena Bazar, Bur Dubai, UAE" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-medium leading-snug">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Business Hours</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mon – Sat</span>
                    <span className="font-medium">10:00 AM – 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">11:00 AM – 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* right: form */}
            <div className="rounded-2xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full mb-5" style={{ background: "var(--gradient-gold)" }}>
                    <CheckCircle2 className="h-9 w-9 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button onClick={() => setSent(false)} className="mt-7 rounded-full px-8" variant="outline">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">Send us a message</h2>
                    <p className="text-sm text-muted-foreground">No account needed — just fill in the form below.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={form.name} onChange={field("name")} required placeholder="Your name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={form.email} onChange={field("email")} required placeholder="you@example.com" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={form.subject} onChange={field("subject")} required placeholder="What is this about?" className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={field("message")}
                      required
                      placeholder="Tell us how we can help you…"
                      className="min-h-[140px] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 rounded-full text-base gap-2"
                    style={{ background: "var(--gradient-luxe)" }}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
