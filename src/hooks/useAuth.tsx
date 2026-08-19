import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const isSecure = window.location.protocol === "https:" ? "Secure;" : "";
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; ${isSecure} SameSite=Strict`;
      } else {
        const isSecure = window.location.protocol === "https:" ? "Secure;" : "";
        document.cookie = `firebase-auth-token=; path=/; max-age=0; ${isSecure} SameSite=Strict`;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    session: user ? { user } : null,
    user,
    loading,
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  };
}
