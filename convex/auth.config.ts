import { AuthConfig } from "convex/server";

// Google is used as the OIDC identity provider for the admin login (replaces
// Hercules's own OIDC service). "domain" must equal the issuer ("iss" claim)
// on the ID token, and "applicationID" must equal the audience ("aud" claim,
// i.e. your Google OAuth client ID). Set GOOGLE_OIDC_CLIENT_ID as a Convex
// environment variable (same value as the frontend's VITE_GOOGLE_CLIENT_ID).
export default {
  providers: [
    {
      domain: "https://accounts.google.com",
      applicationID: process.env.GOOGLE_OIDC_CLIENT_ID!,
    },
  ],
} satisfies AuthConfig;
