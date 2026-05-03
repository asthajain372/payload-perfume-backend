import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Leaf, Flame, Wind, Star, Award, Heart, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — JD09 Perfumes" }] }),
  component: AboutPage,
});

const VALUES = [
  { icon: Leaf, title: "Authentic Fragrances", desc: "We source directly from trusted suppliers — Arabian ouds, French florals, and international niche lines — all hand-picked for quality." },
  { icon: Flame, title: "Arabian Heritage", desc: "Rooted in the rich perfumery culture of the UAE, we celebrate the art of oud, bakhoor, and classic Eastern blends." },
  { icon: Wind, title: "Long-Lasting Scents", desc: "Every fragrance we stock is chosen for its performance on skin. If it doesn't last, it doesn't make our shelves." },
  { icon: Star, title: "Personal Service", desc: "We take time to understand what you're looking for — whether it's your first perfume or your hundredth." },
  { icon: Award, title: "Premium Quality", desc: "From niche international houses to beloved Arabian classics, every bottle meets our quality standard before it reaches you." },
  { icon: Globe, title: "Global & Local", desc: "We bring the world's finest fragrances to the heart of Dubai, alongside the best of regional Arabian perfumery." },
];

const TIMELINE = [
  { year: "2009", title: "Founded in Dubai", desc: "JD09 Perfumes opened its first shop in Meena Bazar, Bur Dubai — the fragrance capital of the UAE." },
  { year: "2013", title: "Growing Collection", desc: "Expanded to carry over 200 unique fragrances spanning Arabian, French, and niche international houses." },
  { year: "2018", title: "Trusted by Thousands", desc: "Word of mouth made us a go-to destination for perfume lovers across the UAE and visiting tourists." },
  { year: "2024", title: "Now Online", desc: "Bringing the JD09 Perfumes experience online — browse, order, and have your favourite scents delivered to your door." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.85 0.12 85 / 0.24), transparent 65%)" }} />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <Heart className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            Our Story
          </div>
          <h1 className="font-display text-6xl font-semibold leading-tight md:text-7xl">
            Fragrance is
            <span className="block" style={{ backgroundImage: "var(--gradient-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              our passion.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Since 2009, JD09 Perfumes has been Dubai's trusted destination for premium Arabian
            and international fragrances — right in the heart of Meena Bazar, Bur Dubai.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <blockquote className="font-display text-2xl font-medium leading-relaxed md:text-3xl">
            "A great fragrance isn't just a scent — it's a feeling, a memory, a signature.
            We're here to help you find yours."
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">— JD09 Perfumes, Bur Dubai</p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What We Stand For</p>
          <h2 className="font-display text-4xl font-semibold">Our Values</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "var(--gradient-gold)" }}>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.85 0.12 85 / 0.2), transparent 70%)" }} />
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Our Journey</p>
            <h2 className="font-display text-4xl font-semibold">How We Got Here</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {TIMELINE.map(({ year, title, desc }) => (
                <div key={year} className="relative flex gap-8">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-border bg-card text-center" style={{ borderColor: "var(--accent)" }}>
                    <span className="font-display text-sm font-semibold" style={{ color: "var(--accent)" }}>{year}</span>
                  </div>
                  <div className="flex-1 pt-4">
                    <h3 className="font-display text-xl font-semibold">{title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-border/50 bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">How It Works</p>
            <h2 className="font-display text-4xl font-semibold">Your Journey with Us</h2>
          </div>
          <div className="grid gap-0 md:grid-cols-4">
            {[
              { step: "01", title: "Curate", desc: "We handpick every fragrance — testing dozens before adding one to our collection." },
              { step: "02", title: "Advise", desc: "Our team helps you find a scent that matches your personality, occasion, and skin chemistry." },
              { step: "03", title: "Order", desc: "Browse in-store in Bur Dubai or order online — we deliver across the UAE." },
              { step: "04", title: "Enjoy", desc: "Your fragrance arrives carefully packed, ready to wear and share." },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative p-8 border-r border-border last:border-r-0">
                <div className="font-display text-6xl font-semibold opacity-10 mb-4">{step}</div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                {i < 3 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-3 w-3 rounded-full" style={{ background: "var(--gradient-gold)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl px-10 py-16 text-center" style={{ background: "var(--gradient-luxe)" }}>
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-10" style={{ background: "var(--gradient-gold)", transform: "translate(30%, -30%)" }} />
          <Sparkles className="mx-auto mb-5 h-8 w-8 text-primary-foreground/60" />
          <h2 className="font-display text-4xl font-semibold text-primary-foreground">Discover your scent.</h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
            Explore the full JD09 Perfumes collection and find the fragrance that becomes unmistakably yours.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-10 rounded-full text-base" style={{ background: "var(--gradient-gold)", color: "var(--primary)" }}>
            <Link to="/collection">Shop the Collection</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
