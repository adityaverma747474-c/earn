import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Coins, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createWithdrawal, getWalletOverview } from "@/lib/wallet.functions";
import {
  MIN_WITHDRAWAL_POINTS,
  PAYOUT_METHODS,
  type PayoutMethod,
  formatPoints,
  payoutLabel,
  pointsToUsd,
} from "@/lib/points";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — TaskVault Rewards" },
      {
        name: "description",
        content:
          "Cash out your TaskVault points to UPI, Paytm or Google Play credit and track every payout request.",
      },
      { property: "og:title", content: "Wallet — TaskVault Rewards" },
      {
        property: "og:description",
        content: "Withdraw points to UPI, Paytm or Google Play and review payout history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const fetchOverview = useServerFn(getWalletOverview);
  const submitWithdrawal = useServerFn(createWithdrawal);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wallet-overview"],
    queryFn: () => fetchOverview({}),
    refetchInterval: 20_000,
  });

  const balance = data?.profile.points_balance ?? 0;

  const [method, setMethod] = useState<PayoutMethod>("upi");
  const [details, setDetails] = useState("");
  const [points, setPoints] = useState(String(MIN_WITHDRAWAL_POINTS));

  const active = PAYOUT_METHODS.find((m) => m.value === method)!;

  const mutation = useMutation({
    mutationFn: () =>
      submitWithdrawal({ data: { method, details: details.trim(), points: Number(points) } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Withdrawal requested — we'll process it shortly.");
      setDetails("");
      setPoints(String(MIN_WITHDRAWAL_POINTS));
      void queryClient.invalidateQueries({ queryKey: ["wallet-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const amount = Number(points);
  const invalid =
    !Number.isInteger(amount) ||
    amount < MIN_WITHDRAWAL_POINTS ||
    amount > balance ||
    details.trim().length < 3;

  return (
    <AppShell balance={balance}>
      <h1 className="font-display text-3xl font-bold">Wallet</h1>
      <p className="mt-1 text-muted-foreground">
        Minimum withdrawal is {formatPoints(MIN_WITHDRAWAL_POINTS)} points (
        {pointsToUsd(MIN_WITHDRAWAL_POINTS)}).
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="panel glow p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="size-5 text-coin" /> Available balance
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-9 w-28" />
          ) : (
            <p className="mt-2 font-display text-4xl font-bold coin-text">{formatPoints(balance)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">≈ {pointsToUsd(balance)}</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!invalid) mutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Payout method</Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYOUT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      method === m.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Payout details</Label>
              <Input
                id="details"
                value={details}
                placeholder={active.placeholder}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points to withdraw</Label>
              <Input
                id="points"
                inputMode="numeric"
                value={points}
                onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-muted-foreground">
                You receive {pointsToUsd(Number.isFinite(amount) ? amount : 0)}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={invalid || mutation.isPending}>
              <WalletIcon className="size-4" />
              {mutation.isPending ? "Requesting…" : "Request withdrawal"}
            </Button>
          </form>
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-lg font-semibold">Payout history</h2>
          <div className="mt-4 space-y-2">
            {isLoading && <Skeleton className="h-16 w-full" />}
            {!isLoading && (data?.withdrawals.length ?? 0) === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No withdrawals yet. Earn {formatPoints(MIN_WITHDRAWAL_POINTS)} points to cash out.
              </p>
            )}
            {data?.withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{payoutLabel(w.payout_method)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {w.payout_details} · {new Date(w.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">-{formatPoints(w.points_deducted)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{w.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
