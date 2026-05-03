import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign In — JD09 Perfumes" }] }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function AuthPage() {
  const { mode: initMode = "signin", redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initMode);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: (redirect as any) ?? "/account" });
    }
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = mode === "signin"
      ? await signIn(parsed.data.email, parsed.data.password)
      : await signUp(parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    if (mode === "signup") toast.success("Account created! Welcome to JD09 Perfumes.");
    else toast.success("Welcome back.");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* minimal header */}
      <header className="border-b border-border/50 px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-1">
          <img src="/logo.jpeg" alt="" className="h-12 w-12 object-contain shrink-0" style={{ mixBlendMode: "multiply" }} draggable={false} />
          <span className="font-display text-xl font-semibold -ml-1">JD09 Perfumes</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* card */}
          <div className="rounded-2xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
            {/* tabs */}
            <div className="mb-8 flex rounded-xl border border-border bg-muted/40 p-1">
              {(["signin", "signup"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h1 className="font-display text-2xl font-semibold text-center mb-1">
              {mode === "signin" ? "Welcome back" : "Join JD09 Perfumes"}
            </h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              {mode === "signin"
                ? "Sign in to view your orders and wishlist."
                : "Create an account to track orders and save favourites."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" required placeholder="you@example.com" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required minLength={6} placeholder="••••••••" className="h-11 pr-11" />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-full text-base mt-2"
                style={{ background: "var(--gradient-luxe)" }} disabled={submitting}>
                {submitting ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-foreground underline-offset-4 hover:underline">
              {mode === "signin" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Have a question?{" "}
            <Link to="/contact" className="font-medium text-foreground underline-offset-4 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
