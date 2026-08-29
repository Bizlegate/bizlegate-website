import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AuthProvider as OidcAuthProvider,
  hasAuthParams,
  useAuth as useOidcAuth,
} from "react-oidc-context";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import type { UserManagerSettings } from "oidc-client-ts";
import { ConvexError } from "convex/values";

/**
 * Local, provider-agnostic replacement for the old `@usehercules/auth`
 * package. It wraps `react-oidc-context` (already a plain dependency) with
 * the same shape the rest of the app expects, so nothing else needs to
 * change. Configured for "Sign in with Google" by default, but any standard
 * OIDC provider works as long as `convex/auth.config.ts` is updated to match
 * (domain = issuer, applicationID = client id).
 */

const AuthManagerContext = createContext<UserManager | null>(null);

function useAuthManager() {
  const ctx = useContext(AuthManagerContext);
  if (!ctx) throw new Error("AuthManagerContext not found");
  return ctx;
}

function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

export function AppAuthProvider({
  children,
  authority,
  client_id,
  client_secret,
  scope = "openid profile email",
  redirect_uri,
}: {
  children: React.ReactNode;
  authority: string;
  client_id: string;
  // Google's "Web application" OAuth client type requires the client secret
  // to be sent when exchanging the authorization code for tokens, even when
  // the frontend otherwise uses PKCE. Without this, Google's token endpoint
  // rejects the exchange with "client_secret is missing". This value is not
  // sensitive in the way a backend secret would be (this app has no backend
  // token exchange step to hide it behind), but keep it out of source
  // control regardless — it's injected via the VITE_GOOGLE_CLIENT_SECRET
  // build-time environment variable.
  client_secret?: string;
  scope?: string;
  redirect_uri?: string;
}) {
  const [userManager] = useState(() => {
    const settings: UserManagerSettings = {
      authority,
      client_id,
      client_secret,
      redirect_uri: redirect_uri ?? `${window.location.origin}/auth/callback`,
      post_logout_redirect_uri: window.location.origin,
      response_type: "code",
      scope,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silentRequestTimeoutInSeconds: 20,
    };
    return new UserManager(settings);
  });

  return (
    <AuthManagerContext.Provider value={userManager}>
      <OidcAuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
        {children}
      </OidcAuthProvider>
    </AuthManagerContext.Provider>
  );
}

/** Same shape the app previously got from `@usehercules/auth/react`'s useAuth(). */
export function useAuth() {
  const userManager = useAuthManager();
  const auth = useOidcAuth();
  const { signoutRedirect, removeUser, signinRedirect } = auth;

  const signout = useCallback(async () => {
    const endSessionEndpoint = await userManager.metadataService.getEndSessionEndpoint();
    if (endSessionEndpoint != null) {
      await signoutRedirect();
    } else {
      await removeUser();
    }
  }, [userManager, signoutRedirect, removeUser]);

  const signin = useCallback(async () => {
    await signinRedirect();
  }, [signinRedirect]);

  return useMemo(() => ({ ...auth, signin, signout }), [auth, signin, signout]);
}

/** Same shape the app previously got from `@usehercules/auth/react`'s useUser(). */
export function useUser() {
  const { user, isLoading, error, isAuthenticated } = useOidcAuth();
  return useMemo(() => {
    const id = user?.profile.sub;
    const name = user?.profile.name;
    const email = user?.profile.email;
    const avatar = user?.profile.picture;
    return { ...(user ?? {}), id, name, email, avatar, isAuthenticated, isLoading, error };
  }, [user, isAuthenticated, isLoading, error]);
}

type CallbackStatus =
  | "processing-oauth"
  | "waiting-backend"
  | "syncing"
  | "success"
  | "error";

/**
 * Simplified re-implementation of the old useAuthCallback hook: drives the
 * /auth/callback page through processing the redirect, waiting for Convex to
 * pick up the new identity, running a one-time sync callback, then reporting
 * success/error so the page can navigate away.
 */
export function useAuthCallback(options: {
  isBackendAuthenticated?: boolean;
  onSync?: () => Promise<void> | void;
  onSuccess?: () => void;
  onNoAuthParams?: () => void;
  timeoutMs?: number;
}) {
  const {
    isBackendAuthenticated = true,
    onSync,
    onSuccess,
    onNoAuthParams,
    timeoutMs = 20000,
  } = options;
  const { isLoading, isAuthenticated, error: oidcError, signinRedirect } = useOidcAuth();
  const [status, setStatus] = useState<CallbackStatus>("processing-oauth");
  const [error, setError] = useState<string | null>(null);
  const hadAuthParams = useRef(hasAuthParams());
  const syncStarted = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Overall timeout guard.
  useEffect(() => {
    if (status === "success" || status === "error") return;
    const t = setTimeout(() => {
      if (mountedRef.current) {
        setStatus("error");
        setError("Authentication timed out. Please try again.");
      }
    }, timeoutMs);
    return () => clearTimeout(t);
  }, [status, timeoutMs]);

  // Step 1: react to the OIDC redirect finishing.
  useEffect(() => {
    if (status !== "processing-oauth") return;
    if (oidcError) {
      setStatus("error");
      setError(oidcError.message || "Authentication failed.");
      return;
    }
    if (!hadAuthParams.current && !isLoading && !isAuthenticated) {
      onNoAuthParams?.();
      return;
    }
    if (!isLoading && isAuthenticated) {
      setStatus("waiting-backend");
    }
  }, [status, isLoading, isAuthenticated, oidcError, onNoAuthParams]);

  // Step 2: once Convex has picked up the new identity, run the one-time sync.
  useEffect(() => {
    if (status !== "waiting-backend" || !isBackendAuthenticated) return;
    if (syncStarted.current) return;
    syncStarted.current = true;

    (async () => {
      setStatus("syncing");
      try {
        await onSync?.();
        if (!mountedRef.current) return;
        setStatus("success");
      } catch (err) {
        console.error("Auth callback sync failed:", err);
        if (!mountedRef.current) return;
        const message =
          err instanceof ConvexError &&
          typeof (err.data as { message?: string })?.message === "string"
            ? (err.data as { message: string }).message
            : err instanceof Error
              ? err.message
              : "Failed to complete authentication. Please try again.";
        setStatus("error");
        setError(message);
      }
    })();
  }, [status, isBackendAuthenticated, onSync]);

  useEffect(() => {
    if (status === "success") onSuccess?.();
  }, [status, onSuccess]);

  const retry = useCallback(async () => {
    try {
      await signinRedirect();
    } catch (err) {
      console.error("Failed to restart auth:", err);
    }
  }, [signinRedirect]);

  return {
    status,
    error,
    isLoading: status !== "success" && status !== "error",
    isSuccess: status === "success",
    isError: status === "error",
    retry,
  };
}
