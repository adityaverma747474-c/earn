/** Shared, client-safe reward constants. */
export const MIN_WITHDRAWAL_POINTS = 1000;

/** 1000 points = $1.00 for display purposes. */
export const POINTS_PER_USD = 1000;

export const PAYOUT_METHODS = [
  { value: "upi", label: "UPI", placeholder: "yourname@okhdfcbank" },
  { value: "paytm", label: "Paytm", placeholder: "10-digit Paytm number" },
  { value: "google_play", label: "Google Play Redeem Code", placeholder: "Email to send the code to" },
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number]["value"];

export function pointsToUsd(points: number): string {
  return `$${(points / POINTS_PER_USD).toFixed(2)}`;
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US").format(points);
}

export function payoutLabel(method: string): string {
  return PAYOUT_METHODS.find((m) => m.value === method)?.label ?? method;
}
