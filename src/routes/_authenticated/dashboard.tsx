import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Coins, Gamepad2, TrendingUp, Wallet, Zap, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWalletOverview } from "@/lib/wallet.functions";
import { formatPoints, pointsToUsd } from "@/lib/points";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - TaskVault Rewards" },
      { name: "description", content: "Track your points balance, lifetime earnings and recent activity." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchOverview = useServerFn(getWalletOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["wallet-overview"],
    queryFn: () => fetchOverview({}),
    refetchInterval: 20_000,
  });

  const profile = data?.profile;

  return (
    <AppShell balance={profile?.points_balance ?? 0}>
      <div className="fade-in-up">
        <h1 className="font-display text-3xl font-bold">
          Welcome back{" "}
          <span className="text-muted-foreground text-2xl font-normal">
            {profile?.email ? `(${profile.email.split("@")[0]})` : ""}
          </span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Complete offers on the Earn page — points land here automatically.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Coins className="size-5 text-primary" />}
          label="Current balance"
          value={isLoading ? null : formatPoints(profile?.points_balance ?? 0)}
          sub={isLoading ? "" : `approx. ${pointsToUsd(profile?.points_balance ?? 0)}`}
          accent="primary"
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-accent" />}
          label="Lifetime points"
          value={isLoading ? null : formatPoints(profile?.total_points_earned ?? 0)}
          sub="All-time earnings"
          accent="accent"
        />
        <StatCard
          icon={<Wallet className="size-5 text-coin" />}
          label="Completed offers"
          value={isLoading ? null : String(data?.transactions.length ?? 0)}
          sub="Last 50 records"
          accent="coin"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Earn CTA */}
        <div className="panel glow-pulse relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Zap className="size-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Ready to earn?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Surveys, app installs and micro-tasks pay out in points instantly.
            </p>
            <Button asChild className="mt-4 gap-2 shadow-md shadow-primary/20 hover:scale-105 transition-all">
              <Link to="/earn">
                <Gamepad2 className="size-4" /> Open offerwall
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* User ID */}
        <div className="panel p-6">
          <h2 className="font-display text-lg font-semibold">Your user ID</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This unique ID is passed to the offerwall so rewards reach your wallet.
          </p>
          <code className="mt-3 block overflow-x-auto rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 font-mono text-xs text-muted-foreground">
            {profile?.id ?? "Loading…"}
          </code>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="panel mt-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          <Link to="/wallet" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            Wallet <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {isLoading && (
            <>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </>
          )}
          {!isLoading && (data?.transactions.length ?? 0) === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Coins className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No transactions yet. Complete your first offer to get started!
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/earn">Go to Earn page</Link>
              </Button>
            </div>
          )}
          {data?.transactions.slice(0, 6).map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 transition-all hover:border-border hover:bg-secondary/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Coins className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium capitalize">{tx.offer_type?.replace(/_/g, " ")}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={
                  tx.status === "chargeback"
                    ? "text-sm font-bold text-destructive"
                    : "text-sm font-bold text-primary"
                }
              >
                {tx.points_credited > 0 ? "+" : ""}
                {formatPoints(tx.points_credited)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  sub: string;
  accent: "primary" | "accent" | "coin";
}) {
  const accentMap = {
    primary: "bg-primary/10 border-primary/20",
    accent: "bg-accent/10 border-accent/20",
    coin: "bg-coin/10 border-coin/20",
  };

  return (
    <div className={`panel p-5 border ${accentMap[accent]}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-28 rounded-lg" />
      ) : (
        <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
