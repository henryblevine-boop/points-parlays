import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ParlayPals" },
      {
        name: "description",
        content:
          "Create your free ParlayPals account to join betting leagues, place simulated bets and climb the standings.",
      },
      { property: "og:title", content: "Sign in — ParlayPals" },
      {
        property: "og:description",
        content: "Create your free ParlayPals account and join a betting league.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [ageOk, setAgeOk] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/home" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageOk) {
      toast.error("You must confirm you are 18 or older.");
      return;
    }
    const parsed = signUpSchema.safeParse({ email, password, username });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: parsed.data.username },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Check your email", {
        description: "Confirm your address to finish creating your account.",
      });
      return;
    }
    navigate({ to: "/home" });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <img src={logo} alt="ParlayPals logo" width={36} height={36} className="size-9" />
        <span className="font-display text-2xl font-extrabold">
          Parlay<span className="text-primary">Pals</span>
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-3 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full font-display font-bold" disabled={loading}>
                Log in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="su-username">Username</Label>
                <Input
                  id="su-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <Input
                  id="su-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={ageOk}
                  onCheckedChange={(v) => setAgeOk(v === true)}
                  className="mt-0.5"
                />
                I confirm I am 18 years or older and understand this app is free to play with no
                real money wagering.
              </label>
              <Button type="submit" className="w-full font-display font-bold" disabled={loading}>
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          Continue with Google
        </Button>
      </div>

      <p className="mt-6 max-w-sm text-center text-[11px] text-muted-foreground">
        Free to play. No real money wagering. Must be 18+.
      </p>
    </div>
  );
}
