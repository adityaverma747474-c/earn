import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App | undefined;

try {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      console.error(
        "[Firebase Admin] Missing env vars:",
        JSON.stringify({ projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!privateKeyRaw })
      );
      throw new Error("Missing Firebase Admin env vars");
    }

    // Handle newline characters in the private key (Vercel escapes them)
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    console.log("[Firebase Admin] Initialized successfully for project:", projectId);
  } else {
    app = getApps()[0];
  }
} catch (err) {
  console.error("[Firebase Admin] Init failed:", err);
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
