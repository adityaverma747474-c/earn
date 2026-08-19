import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { adminAuth } from "./admin";

export const requireFirebaseAuth = createMiddleware().server(async ({ next }) => {
  try {
    const token = getCookie("firebase-auth-token");
    
    // Debug log
    console.log("[Auth Middleware] Token from getCookie:", token ? "Found" : "Missing");

    if (!token) {
      console.log("[Auth Middleware] Error: No token found in cookies.");
      throw new Error("Unauthorized: No token provided");
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log("[Auth Middleware] Token verified for UID:", decodedToken.uid);
      return next({
        context: {
          userId: decodedToken.uid,
          email: decodedToken.email,
        },
      });
    } catch (verifyError: any) {
      console.log("[Auth Middleware] Token verification failed:", verifyError.message);
      throw verifyError;
    }
  } catch (error: any) {
    console.log("[Auth Middleware] Overall Catch Error:", error.message);
    throw new Error("Unauthorized");
  }
});
