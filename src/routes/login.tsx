import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    toast.success("Welcome back.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* back to store */}
        <div className="mb-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to store
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
          {/* logo */}
          <div className="mb-8 flex flex-col items-center gap-1">
            <img src="/logo.jpeg" alt="JD09 Perfumes" className="h-24 w-24 object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
            <div className="text-center -mt-1">
              <p className="font-display text-xl font-semibold">JD09 Perfumes</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Admin Portal</p>
            </div>
          </div>

          {/* lock badge */}
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-2.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Authorised personnel only
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-center mb-1">Sign in</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Enter your admin credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="admin@maisonaria.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full h-11 rounded-full" style={{ background: "var(--gradient-luxe)" }} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          No account? Contact your store owner to get access.
        </p>
      </div>
    </div>
  );
}
