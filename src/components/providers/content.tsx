import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ContentContext, type MediaValue } from "@/hooks/use-content.ts";

// Where the last-successful load of CMS content/media is cached in this
// browser (see the useState initializers below for why). Versioned so a
// future shape change can invalidate old caches just by bumping this.
const CONTENT_CACHE_KEY = "bizlegate:contentCache:v1";
const MEDIA_CACHE_KEY = "bizlegate:mediaCache:v1";

function readCache<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    // Private browsing, disabled storage, corrupted JSON, etc. — just skip
    // the cache; the page still works, it only loses the anti-flash below.
    return undefined;
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — nothing to do, not fatal.
  }
}

/**
 * Loads all editable text + media once and provides it to the whole app.
 * These queries are public (no auth required) so the marketing site renders
 * for anonymous visitors. Pages use baked-in code defaults until data
 * arrives.
 *
 * "Data arrives" is the catch: useQuery returns `undefined` on first render
 * (the Convex query hasn't resolved yet), so every CMS-driven photo/text on
 * the page would otherwise show the hardcoded code default first, then jump
 * to the real admin-edited value a moment later — the "old photo flashes
 * before the new one" issue (2026-10-09). There's no SSR here (static
 * GitHub Pages + a client-fetched Convex query), so the very first render
 * can never know the live value in time — but a RETURNING visitor doesn't
 * need the code default as a placeholder; they can start from whatever this
 * browser last successfully loaded, which is almost always correct and at
 * worst a few seconds stale. That's what the localStorage cache below is
 * for: seed state from it instead of `undefined`, then swap to the fresh
 * query result (and refresh the cache) once it resolves. A brand-new
 * visitor with no cache yet still sees one flash on their very first page
 * load — unavoidable without SSR — but every load after that is clean.
 */
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const liveContent = useQuery(api.content.getAllContent, {});
  const liveMedia = useQuery(api.content.getAllMedia, {});

  const [content, setContent] = useState<Record<string, string> | undefined>(
    () => readCache(CONTENT_CACHE_KEY),
  );
  const [media, setMedia] = useState<Record<string, MediaValue> | undefined>(
    () => readCache(MEDIA_CACHE_KEY),
  );

  useEffect(() => {
    if (liveContent === undefined) return;
    setContent(liveContent);
    writeCache(CONTENT_CACHE_KEY, liveContent);
  }, [liveContent]);

  useEffect(() => {
    if (liveMedia === undefined) return;
    setMedia(liveMedia);
    writeCache(MEDIA_CACHE_KEY, liveMedia);
  }, [liveMedia]);

  return (
    <ContentContext.Provider value={{ content, media }}>
      {children}
    </ContentContext.Provider>
  );
}
