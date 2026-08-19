import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { adminDb } from "@/integrations/firebase/admin";
import * as admin from "firebase-admin";

const withdrawalSchema = z.object({
  method: z.enum(["upi", "paytm", "google_play"]),
  details: z.string().trim().min(3).max(120),
  points: z.number().int().min(1000).max(10_000_000),
});

export const getWalletOverview = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    try {
      const profileRef = adminDb.collection("profiles").doc(userId);
      const profileSnap = await profileRef.get();
      const profileData = profileSnap.data();

      // We will attempt to get transactions and withdrawals, but if it fails due to missing index,
      // we'll catch it and just return empty lists for now.
      let transactions: any[] = [];
      let withdrawals: any[] = [];

      try {
        const transactionsRef = adminDb.collection("transactions").where("user_id", "==", userId).orderBy("created_at", "desc").limit(50);
        const txSnap = await transactionsRef.get();
        transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err: any) {
        console.error("Transactions query error (likely missing index):", err.message);
      }

      try {
        const withdrawalsRef = adminDb.collection("withdrawals").where("user_id", "==", userId).orderBy("created_at", "desc").limit(50);
        const wdSnap = await withdrawalsRef.get();
        withdrawals = wdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err: any) {
        console.error("Withdrawals query error (likely missing index):", err.message);
      }

      return {
        profile: {
          id: userId,
          email: profileData?.email || null,
          points_balance: profileData?.points_balance || 0,
          total_points_earned: profileData?.total_points_earned || 0,
          created_at: profileData?.created_at || new Date().toISOString(),
        },
        transactions,
        withdrawals,
      };
    } catch (e: any) {
      console.error("getWalletOverview total failure:", e);
      throw e;
    }
  });

export const createWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((data: unknown) => withdrawalSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    try {
      await adminDb.runTransaction(async (transaction) => {
        const profileRef = adminDb.collection("profiles").doc(userId);
        const profileDoc = await transaction.get(profileRef);

        if (!profileDoc.exists) {
          throw new Error("Profile not found");
        }

        const currentPoints = profileDoc.data()?.points_balance || 0;

        if (currentPoints < data.points) {
          throw new Error("Insufficient points balance");
        }

        // Deduct points
        transaction.update(profileRef, {
          points_balance: currentPoints - data.points
        });

        // Record withdrawal
        const newWithdrawalRef = adminDb.collection("withdrawals").doc();
        transaction.set(newWithdrawalRef, {
          user_id: userId,
          payout_method: data.method,
          payout_details: data.details,
          points_deducted: data.points,
          status: "pending",
          created_at: new Date().toISOString()
        });
      });

      return { ok: true as const };
    } catch (error: any) {
      return { ok: false as const, error: error.message };
    }
  });

/** Public: the TimeWall app/public id used to build the offerwall iframe URL. */
export const getOfferwallConfig = createServerFn({ method: "GET" }).handler(async () => {
  console.log("[Offerwall Config] Returning TIMEWALL_PUBLIC_ID:", process.env["TIMEWALL_PUBLIC_ID"]);
  return {
    publicId: process.env["TIMEWALL_PUBLIC_ID"] || "dummy_id",
  };
});
