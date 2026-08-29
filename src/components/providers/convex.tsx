import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuthFromOidc } from "@/lib/convex-oidc-auth.ts";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3000";
const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromOidc}>
      {children}
    </ConvexProviderWithAuth>
  );
}
