import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { getOfferwallConfig, getWalletOverview } from "@/lib/wallet.functions";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({
    meta: [
      { title: "Earn Points — TaskVault Offerwall" },
      {
        name: "description",
        content:
          "Complete surveys, app trials and micro-tasks on the offerwall and get points credited to your TaskVault wallet automatically.",
      },
      { property: "og:title", content: "Earn Points — TaskVault Offerwall" },
      {
        property: "og:description",
        content: "Surveys, app trials and micro-tasks that pay out in points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EarnPage,
});

const STEPS = [
  "Pick an offer or survey from the wall below.",
  "Follow every instruction fully — partial completions do not pay.",
  "Keep the offer tab open until the provider confirms completion.",
  "Points are credited automatically within seconds of confirmation.",
];

function EarnPage() {
  const fetchOverview = useServerFn(getWalletOverview);
  const fetchConfig = useServerFn(getOfferwallConfig);

  const { data: overview } = useQuery({
    queryKey: ["wallet-overview"],
    queryFn: () => fetchOverview({}),
    refetchInterval: 20_000,
  });
  const { data: config, isLoading } = useQuery({
    queryKey: ["offerwall-config"],
    queryFn: () => fetchConfig({}),
  });

  const userId = overview?.profile.id;
  const publicId = config?.publicId;
  const iframeUrl =
    publicId && userId
      ? `https://timewall.io/users/login?oid=${encodeURIComponent(publicId)}&uid=${encodeURIComponent(userId)}`
      : null;

  return (
    <AppShell balance={overview?.profile.points_balance ?? 0}>
      <h1 className="font-display text-3xl font-bold">Earn points</h1>
      <p className="mt-1 text-muted-foreground">
        Complete tasks on the offerwall — rewards are verified and credited automatically.
      </p>

      <div className="mt-6">
        <div className="panel overflow-hidden">
          {isLoading && <Skeleton className="h-[720px] w-full" />}
          {!isLoading && iframeUrl && (
            <div style={{ height: "720px", overflow: "hidden", position: "relative", borderRadius: "inherit" }}>
              <iframe
                src={iframeUrl}
                title="Offerwall"
                style={{
                  width: "100%",
                  height: "800px",
                  border: "none",
                  marginTop: "-60px",
                  display: "block",
                  filter: "invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.95)",
                }}
                allow="clipboard-write; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
              />
              {/* Bottom overlay to hide TimeWall disclaimer */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "130px",
                  background: "oklch(0.11 0.02 264)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              />
            </div>
          )}
          {!isLoading && !iframeUrl && (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
              <Info className="size-8 text-muted-foreground" />
              <p className="font-display text-lg font-semibold">Offerwall not configured yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                The offerwall configuration is missing or incomplete.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
