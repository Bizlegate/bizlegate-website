import { useCallback, useMemo, useRef } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

/**
 * Local replacement for `@usehercules/auth/convex-react`'s internal
 * `useUseAuthFromHercules` hook. Feeds Convex's `ConvexProviderWithAuth`
 * (from the official `convex/react` package) with the OIDC ID token, and
 * refreshes it silently before it expires. Works with any OIDC provider
 * configured in `src/components/providers/auth.tsx`.
 */
// Refresh if the token expires within 5 minutes. This must be meaningfully
// shorter than the ID token's actual lifetime (Google's ID tokens are valid
// for ~1 hour). Setting this equal to (or close to) the token lifetime means
// almost every post-login check thinks the token is "expiring soon" and
// immediately kicks off a silent renew — which fails for Google (it does not
// support silent re-authentication via a hidden iframe in this setup), and
// that failure was being misread as "the user signed out," bouncing them
// straight back to the sign-in screen seconds after a successful login.
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export function useAuthFromOidc() {
  const { isAuthenticated, user, isLoading, signinSilent } = useOidcAuth();
  const idToken = user?.id_token;
  const expiresAt = user?.expires_at; // unix seconds

  const idTokenRef = useRef(idToken);
  idTokenRef.current = idToken;
  const expiresAtRef = useRef(expiresAt);
  expiresAtRef.current = expiresAt;
  const signinSilentRef = useRef(signinSilent);
  signinSilentRef.current = signinSilent;
  const inFlightRefresh = useRef<Promise<string | null> | null>(null);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const currentToken = idTokenRef.current;
      const currentExpiresAt = expiresAtRef.current;

      if (!forceRefreshToken) return currentToken ?? null;

      const expiresSoon =
        currentExpiresAt === undefined ||
        currentExpiresAt * 1000 - Date.now() < REFRESH_THRESHOLD_MS;
      if (currentToken != null && !expiresSoon) return currentToken;

      if (inFlightRefresh.current) return inFlightRefresh.current;

      const refresh = (async () => {
        try {
          const refreshed = await signinSilentRef.current();
          return refreshed?.id_token ?? currentToken ?? null;
        } catch {
          // Google does not support silent (hidden-iframe) re-authentication
          // in this setup, so this will fail every time it's attempted. As
          // long as the token we already have isn't actually expired yet,
          // keep using it rather than signing the user out — a failed
          // "refresh soon" attempt should never look like a logout.
          const stillValid =
            currentExpiresAt !== undefined &&
            currentExpiresAt * 1000 - Date.now() > 0;
          return stillValid ? (currentToken ?? null) : null;
        } finally {
          inFlightRefresh.current = null;
        }
      })();
      inFlightRefresh.current = refresh;
      return refresh;
    },
    [],
  );

  return useMemo(
    () => ({
      isLoading: isAuthenticated ? false : isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );
}
