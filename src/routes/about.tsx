import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Leaf, Flame, Wind, Star, Award, Heart, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Maison Aria" }] }),
  component: AboutPage,
});

const VALUES = [
  { icon: Leaf, title: "Natural Sourcing", desc: "Every raw material is ethically sourced from growers we trust. We visit our suppliers in person — no shortcuts, no compromises." },
  { icon: Flame, title: "Master Perfumers", desc: "Each formula is co-developed with certified perfumers trained in Grasse, the world capital of fine fragrance." },
  { icon: Wind, title: "Longevity First", desc: "We reformulate until a fragrance performs on skin for at least 8 hours. Most of ours last 10–14." },
  { icon: Star, title: "Small Batches", desc: "We cap each release at 500 bottles. Scarcity is not a marketing trick — it's how we maintain quality." },
  { icon: Award, title: "Cruelty Free", desc: "100% cruelty-free. Never tested on animals, never will be. PETA certified since our first day." },
  { icon: Globe, title: "Carbon Neutral", desc: "Every order offsets its shipping carbon. Our bottles are recycled glass. Boxes are FSC-certified paper." },
];

const TIMELINE = [
  { year: "2019", title: "The Idea", desc: "Founder Aria Rousseau, tired of synthetic celebrity fragrances, travels to Grasse and falls in love with real perfumery." },
  { year: "2020", title: "First Formula", desc: "After 18 months of development, Rose Éternelle is created — still our bestselling scent." },
  { year: "2022", title: "First 100 Orders", desc: "Launched with three fragrances. Sold out in 11 days entirely by word of mouth." },
  { year: "2024", title: "Maison Aria", desc: "The full Maison launches with twelve compositions spanning six olfactory families." },
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
            Born from a
            <span className="block" style={{ backgroundImage: "var(--gradient-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              single belief.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            That a great perfume doesn't shout. It stays. It becomes part of how people remember you —
            a quiet signature that outlasts the room.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <blockquote className="font-display text-2xl font-medium leading-relaxed md:text-3xl">
            "We don't make fragrances for trends. We make them for memories — for the version of yourself
            you want people to recall long after you've left the room."
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">— Aria Rousseau, Founder</p>
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
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Behind Every Bottle</p>
            <h2 className="font-display text-4xl font-semibold">Our Process</h2>
          </div>
          <div className="grid gap-0 md:grid-cols-4">
            {[
              { step: "01", title: "Sourcing", desc: "We visit farms and distilleries personally to select the finest raw materials." },
              { step: "02", title: "Composing", desc: "Our perfumers craft each formula through dozens of revisions over 12–18 months." },
              { step: "03", title: "Testing", desc: "Every batch is tested on 50+ volunteers for 30 days before approval." },
              { step: "04", title: "Bottling", desc: "Hand-filled into recycled glass and sealed with our signature wax stamp." },
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
            Explore the full Maison Aria collection and find the fragrance that becomes unmistakably yours.
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
