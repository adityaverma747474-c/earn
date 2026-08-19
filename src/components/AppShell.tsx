import { Link, useNavigate } from "@tanstack/react-router";
import { Coins, Gamepad2, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatPoints } from "@/lib/points";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/earn", label: "Earn", icon: Gamepad2 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
] as const;

export function AppShell({ children, balance }: { children: ReactNode; balance?: number }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-surface">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold group">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/40">
              <Coins className="size-4" />
            </span>
            <span className="hidden sm:inline bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              TaskVault
            </span>
          </Link>

          <nav className="ml-2 flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground [&.active]:bg-primary/15 [&.active]:text-primary [&.active]:shadow-sm"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {typeof balance === "number" && (
              <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-primary/15">
                <Coins className="size-4 text-primary" />
                <span className="coin-text">{formatPoints(balance)}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title={user?.email ?? "Sign out"}
              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
