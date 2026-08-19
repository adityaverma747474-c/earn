import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { auth } from "@/integrations/firebase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Basic client-side check. Wait for Firebase to initialize its state.
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
    
    if (!auth.currentUser) throw redirect({ to: "/auth" });
    return { user: auth.currentUser };
  },
  component: () => <Outlet />,
});
