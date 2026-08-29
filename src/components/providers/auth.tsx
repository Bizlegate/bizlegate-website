import { AppAuthProvider } from "@/lib/oidc-auth.tsx";

// Google OAuth is used as the OIDC provider for the admin login (replaces
// Hercules's own OIDC service). Set VITE_GOOGLE_CLIENT_ID and
// VITE_GOOGLE_CLIENT_SECRET in your Netlify environment variables (Google
// Cloud Console -> APIs & Services -> Credentials -> OAuth client ID ->
// Web application). The matching convex/auth.config.ts must use the same
// client ID as its applicationID.
//
// The client secret is required here because Google's token endpoint
// rejects the authorization-code exchange for "Web application" clients
// without it ("client_secret is missing"), even though this app otherwise
// authenticates as a public SPA client via PKCE.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppAuthProvider
      authority="https://accounts.google.com"
      client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID!}
      client_secret={import.meta.env.VITE_GOOGLE_CLIENT_SECRET}
      scope="openid profile email"
    >
      {children}
    </AppAuthProvider>
  );
}
