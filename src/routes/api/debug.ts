import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug")({
  server: {
    handlers: {
      GET: async () => {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

        let firebaseError = null;
        let firebaseOk = false;

        try {
          const { getApps, initializeApp, cert } = await import("firebase-admin/app");
          const { getAuth } = await import("firebase-admin/auth");

          if (getApps().length === 0) {
            if (!projectId || !clientEmail || !privateKeyRaw) {
              throw new Error("Missing: projectId=" + !!projectId + " email=" + !!clientEmail + " key=" + !!privateKeyRaw);
            }
            const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
            initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
          }
          getAuth();
          firebaseOk = true;
        } catch (err: any) {
          firebaseError = err?.message || String(err);
        }

        const info = {
          firebase_ok: firebaseOk,
          firebase_error: firebaseError,
          env: {
            FIREBASE_PROJECT_ID: projectId ? projectId.substring(0, 15) + "..." : "MISSING",
            FIREBASE_CLIENT_EMAIL: clientEmail ? clientEmail.substring(0, 25) + "..." : "MISSING",
            FIREBASE_PRIVATE_KEY: privateKeyRaw
              ? "len=" + privateKeyRaw.length + " starts=" + privateKeyRaw.substring(0, 30)
              : "MISSING",
            TIMEWALL_PUBLIC_ID: process.env.TIMEWALL_PUBLIC_ID ? "SET" : "MISSING",
            TIMEWALL_SECRET_KEY: process.env.TIMEWALL_SECRET_KEY ? "SET" : "MISSING",
            NODE_ENV: process.env.NODE_ENV,
          },
        };

        return new Response(JSON.stringify(info, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
  component: () => null,
});
