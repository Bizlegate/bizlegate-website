import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// Google's real token endpoint (from its OIDC discovery document at
// https://accounts.google.com/.well-known/openid-configuration). Stable —
// Google has published this exact URL for years — but if Google ever
// rotates it, update it here.
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/**
 * Proxies the one step of the admin login flow that genuinely needs a
 * secret: exchanging Google's authorization code for tokens. Everything
 * else (the PKCE challenge, the redirect to Google's consent screen)
 * happens directly in the browser against Google — see
 * src/lib/oidc-auth.tsx, which points token_endpoint at this route via
 * `metadataSeed` instead of the frontend building its own request to
 * Google. This exists because Google's "Web application" OAuth client
 * type rejects the code exchange without a client_secret even when PKCE is
 * used ("client_secret is missing") — there is no Google client type for
 * a web app that skips this. Keeping that exchange here means
 * GOOGLE_CLIENT_SECRET only ever lives as a Convex environment variable
 * (`npx convex env set GOOGLE_CLIENT_SECRET ...`), never in anything Vite
 * bundles and ships to the browser.
 *
 * oidc-client-ts posts here with `client_secret` already omitted (its
 * default "client_secret_post" auth mode just skips appending it when
 * undefined) — this handler adds it before forwarding, then relays
 * Google's response back verbatim.
 */
const http = httpRouter();

http.route({
  path: "/oauth/google/token",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientSecret) {
      return new Response(
        JSON.stringify({
          error: "server_error",
          error_description: "GOOGLE_CLIENT_SECRET is not configured on this Convex deployment.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }

    const params = new URLSearchParams(await request.text());
    params.set("client_secret", clientSecret);

    const googleResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const body = await googleResponse.text();
    return new Response(body, {
      status: googleResponse.status,
      headers: {
        "Content-Type": googleResponse.headers.get("Content-Type") ?? "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Defensive CORS preflight handler. The actual POST above is a CORS
// "simple request" (form-urlencoded body, no custom headers) so browsers
// shouldn't send an OPTIONS preflight for it in practice, but this avoids
// a 404 if one ever is sent.
http.route({
  path: "/oauth/google/token",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
