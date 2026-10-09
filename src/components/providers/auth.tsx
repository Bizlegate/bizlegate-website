import { AppAuthProvider } from "@/lib/oidc-auth.tsx";

// Google OAuth is used as the OIDC provider for the admin login (replaces
// Hercules's own OIDC service). Set VITE_GOOGLE_CLIENT_ID in your GitHub
// Actions build secrets (Google Cloud Console -> APIs & Services ->
// Credentials -> OAuth client ID -> Web application). The matching
// convex/auth.config.ts must use the same client ID as its applicationID.
//
// There is no VITE_GOOGLE_CLIENT_SECRET here on purpose — Vite would bundle
// a VITE_-prefixed value straight into the public JS shipped to every
// visitor's browser. The one step that needs it (the authorization-code
// token exchange — Google's "Web application" client type requires this
// even with PKCE) is proxied through a Convex HTTP action instead, where
// GOOGLE_CLIENT_SECRET lives as a server-side Convex environment variable.
// See convex/http.ts and the tokenEndpointProxy comment in oidc-auth.tsx.
//
// Convex's HTTP Actions are served from the same deployment at
// *.convex.site instead of the *.convex.cloud the JS client talks to —
// same deployment, different suffix, so no extra env var is needed here.
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_URL?.replace(
  /\.convex\.cloud\/?$/,
  ".convex.site",
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppAuthProvider
      authority="https://accounts.google.com"
      client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID!}
      tokenEndpointProxy={`${CONVEX_SITE_URL}/oauth/google/token`}
      scope="openid profile email"
      // Without this, Google never hands back a refresh_token, so once the
      // ~1-hour access token expires the only way to renew is a silent
      // "prompt=none" request in a hidden iframe — which Google blocks
      // outright (accounts.google.com refuses to be framed), so renewal
      // always fails and the admin gets signed out. access_type=offline
      // asks for a refresh_token; prompt=consent guarantees Google actually
      // includes one (Google otherwise only sends it the very first time a
      // given user approves this app, and this admin already approved it
      // once before without this param). With a refresh_token stored,
      // oidc-client-ts's automaticSilentRenew (already on, above) renews
      // directly against the token endpoint instead of the iframe — no
      // page reload, no re-login. The one-time cost: the next sign-in shows
      // Google's "choose what Bizlegate can access" screen again; after
      // that it should stay signed in.
      extraQueryParams={{ access_type: "offline", prompt: "consent" }}
    >
      {children}
    </AppAuthProvider>
  );
}
