import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ContentContext } from "@/hooks/use-content.ts";

/**
 * Loads all editable text + media once and provides it to the whole app.
 * These queries are public (no auth required) so the marketing site renders
 * for anonymous visitors. Pages use baked-in defaults until data arrives.
 */
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const content = useQuery(api.content.getAllContent, {});
  const media = useQuery(api.content.getAllMedia, {});

  return (
    <ContentContext.Provider value={{ content, media }}>
      {children}
    </ContentContext.Provider>
  );
}
