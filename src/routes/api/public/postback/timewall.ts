import { createFileRoute } from "@tanstack/react-router";
import { adminDb } from "@/integrations/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * TimeWall server-to-server postback.
 *
 * GET /api/public/postback/timewall
 *   ?userID=...&transactionID=...&revenue=...&currencyAmount=...
 *   &hash=...&type=credit|chargeback|hold|hold_cancelled&withdrawid=...
 *
 * Security:
 *  - request IP must be one of TimeWall's documented IPs
 *    (bypass for local testing with TIMEWALL_ALLOW_ALL_IPS=true)
 *  - hash must equal sha256(userID + revenue + TIMEWALL_SECRET_KEY)
 *    using the RAW, unmodified revenue string.
 */

const ALLOWED_IPS = ["18.156.132.55", "51.81.120.73", "142.111.248.18"];

function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() ?? "";
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/postback/timewall")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams;

        const userID = q.get("userID") ?? "";
        const transactionID = q.get("transactionID") ?? "";
        const revenue = q.get("revenue") ?? ""; // raw string — never reformat/round
        const currencyAmountRaw = q.get("currencyAmount") ?? "0";
        const hash = (q.get("hash") ?? "").toLowerCase();
        const type = (q.get("type") ?? "credit").toLowerCase();
        const withdrawid = q.get("withdrawid") ?? null;

        const secret = process.env["TIMEWALL_SECRET_KEY"];
        if (!secret) {
          console.error("[timewall] TIMEWALL_SECRET_KEY is not configured");
          return new Response("Server not configured", { status: 500 });
        }

        // 1. IP allowlist
        const allowAllIps = process.env["TIMEWALL_ALLOW_ALL_IPS"] === "true";
        const ip = getClientIp(request);
        if (!allowAllIps && !ALLOWED_IPS.includes(ip)) {
          console.warn(`[timewall] rejected postback from IP ${ip || "unknown"}`);
          return new Response("Forbidden", { status: 403 });
        }

        if (!userID || !transactionID) {
          return new Response("Missing parameters", { status: 400 });
        }

        // 2. Hash validation: sha256(userID + revenue + secret)
        const expected = await sha256Hex(`${userID}${revenue}${secret}`);
        if (!timingSafeEqualHex(expected, hash)) {
          console.warn(`[timewall] invalid hash for transaction ${transactionID}`);
          return new Response("Invalid hash", { status: 403 });
        }

        // Hold states are logged only — never credited.
        if (type === "hold" || type === "hold_cancelled") {
          console.info(`[timewall] ignoring ${type} for transaction ${transactionID}`);
          return new Response("OK", { status: 200 });
        }

        const currencyAmount = Math.round(Math.abs(Number(currencyAmountRaw) || 0));
        const amountUsd = Number(revenue) || 0;

        try {
          await adminDb.runTransaction(async (t) => {
            const txQuery = adminDb.collection("transactions").where("transaction_id", "==", transactionID).limit(1);
            const txQuerySnap = await t.get(txQuery);
            const existingTx = txQuerySnap.empty ? null : txQuerySnap.docs[0];
            const profileRef = adminDb.collection("profiles").doc(userID);
            
            if (type === "chargeback") {
              if (existingTx && existingTx.data().status === "chargeback") {
                return; // Already chargebacked
              }
              
              // Apply chargeback
              t.update(profileRef, {
                points_balance: FieldValue.increment(-currencyAmount),
                total_points_earned: FieldValue.increment(-currencyAmount)
              });

              if (existingTx) {
                t.update(existingTx.ref, { status: "chargeback" });
              } else {
                const newTxRef = adminDb.collection("transactions").doc();
                t.set(newTxRef, {
                  user_id: userID,
                  transaction_id: transactionID,
                  offer_type: withdrawid ? "timewall_withdraw" : "timewall",
                  amount_usd: amountUsd,
                  points_credited: -currencyAmount,
                  status: "chargeback",
                  created_at: new Date().toISOString()
                });
              }
              return;
            }

            // type === 'credit'
            if (existingTx) {
              console.info(`[timewall] duplicate transaction ${transactionID} ignored`);
              return;
            }

            // Insert new transaction and credit
            const newTxRef = adminDb.collection("transactions").doc();
            t.set(newTxRef, {
              user_id: userID,
              transaction_id: transactionID,
              offer_type: withdrawid ? "timewall_withdraw" : "timewall",
              amount_usd: amountUsd,
              points_credited: currencyAmount,
              status: "credited",
              created_at: new Date().toISOString()
            });

            t.update(profileRef, {
              points_balance: FieldValue.increment(currencyAmount),
              total_points_earned: FieldValue.increment(currencyAmount)
            });
          });
          
          return new Response("OK", { status: 200 });
        } catch (error: any) {
          console.error("[timewall] transaction error", error.message);
          return new Response("Error", { status: 500 });
        }
      },
    },
  },
});
