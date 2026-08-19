import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Gamepad2, ShieldCheck, Star, TrendingUp, Users, Wallet, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MIN_WITHDRAWAL_POINTS, PAYOUT_METHODS, formatPoints } from "@/lib/points";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskVault - Earn Reward Points for Free" },
      { name: "description", content: "Complete surveys and micro-tasks, earn points instantly and cash out to UPI, Paytm or Google Play." },
      { property: "og:title", content: "TaskVault - Earn Reward Points for Free" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Gamepad2, title: "Daily Offers & Surveys", text: "Surveys, app installs and micro-tasks from the offerwall, refreshed daily.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Zap, title: "Instant Crediting", text: "Verified server-to-server postbacks credit your wallet seconds after completion.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: ShieldCheck, title: "Fully Secure", text: "IP allowlisting, signed postbacks and chargeback handling keep the economy fair.", color: "text-accent", bg: "bg-accent/10" },
  { icon: Wallet, title: "Flexible Cashouts", text: `Withdraw from ${formatPoints(MIN_WITHDRAWAL_POINTS)} pts to ${PAYOUT_METHODS.map((m) => m.label).join(", ")}.`, color: "text-coin", bg: "bg-coin/10" },
];

const STATS = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: TrendingUp, value: "50L+ pts", label: "Paid Out" },
  { icon: Star, value: "4.9 stars", label: "User Rating" },
];

function Landing() {
  return (
    <div className="hero-surface min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2.5 font-display text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground float">
            <Coins className="size-5" />
          </span>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            TaskVault
          </span>
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="shadow-lg shadow-primary/25">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pt-24">
        <div className="fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          1,000 points = Rs.1.00 - Withdraw anytime
        </div>

        <h1 className="fade-in-up mt-6 font-display text-5xl font-bold leading-tight sm:text-7xl" style={{ animationDelay: "0.1s" }}>
          Turn spare minutes into{" "}
          <span className="coin-text">real rewards</span>
        </h1>

        <p className="fade-in-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          Complete quick surveys and offers, watch your balance grow in real time, and cash out to
          UPI, Paytm or Google Play instantly.
        </p>

        <div className="fade-in-up mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.3s" }}>
          <Button asChild size="lg" className="group gap-2 px-8 shadow-xl shadow-primary/30 transition-all hover:shadow-primary/50 hover:scale-105">
            <Link to="/auth">
              Start earning free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/50 backdrop-blur hover:border-primary/40">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </div>

        <div className="fade-in-up mt-14 flex flex-wrap justify-center gap-10" style={{ animationDelay: "0.4s" }}>
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Icon className="size-4 text-primary" />
                <span className="font-display text-2xl font-bold coin-text">{value}</span>
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text, color, bg }, i) => (
          <article key={title} className="panel-interactive p-6 fade-in-up" style={{ animationDelay: `${0.1 * i + 0.5}s` }}>
            <div className={`inline-flex size-11 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <h2 className="mt-4 font-display text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="panel glow-pulse relative overflow-hidden p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Ready to start earning?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Join thousands of users earning daily. No investment needed.
          </p>
          <Button asChild size="lg" className="relative mt-6 gap-2 shadow-lg shadow-primary/30 hover:scale-105 transition-all">
            <Link to="/auth">
              Create Free Account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="grid size-6 place-items-center rounded-lg bg-primary/20 text-primary">
            <Coins className="size-3.5" />
          </span>
          <span className="font-display font-semibold text-foreground/60">TaskVault</span>
        </div>
        (c) {new Date().getFullYear()} TaskVault. Rewards subject to offer provider verification.
      </footer>
    </div>
  );
}
