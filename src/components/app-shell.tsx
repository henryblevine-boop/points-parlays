import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, Search, MessagesSquare, Users, User } from "lucide-react";

import logo from "@/assets/logo.png";
import { BetSlipProvider } from "@/lib/bet-slip";
import { BetSlipDrawer } from "@/components/bet-slip-drawer";
import { useSessionUser } from "@/hooks/use-session-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/social", label: "Social", icon: MessagesSquare },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell() {
  const { user } = useSessionUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Make sure every signed-in user has a profile row.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (data) return;
      const fallback =
        (user.user_metadata?.["username"] as string | undefined) ??
        user.email?.split("@")[0] ??
        `player_${user.id.slice(0, 6)}`;
      await supabase.from("profiles").insert({ id: user.id, username: fallback });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    })();
  }, [user, queryClient]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <BetSlipProvider>
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/home" className="flex items-center gap-2">
              <img src={logo} alt="Solis-Fantasy logo" width={28} height={28} className="size-7" />
              <span className="font-display text-lg font-extrabold tracking-tight">
                Solis-<span className="text-primary">Fantasy</span>
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs">
              Log out
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-4">
          <Outlet />
          <p className="pt-8 text-center text-[11px] text-muted-foreground">
            Free to play. No real money wagering. Must be 18+.
          </p>
        </main>

        {user && <BetSlipDrawer userId={user.id} />}

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card">
          <div className="mx-auto grid max-w-2xl grid-cols-5">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors data-[status=active]:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                <tab.icon className="size-5" aria-hidden />
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </BetSlipProvider>
  );
}
