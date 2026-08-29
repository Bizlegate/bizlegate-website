import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export type AccessLevel = "admin" | "staff" | "none";

/**
 * Returns the current user's backend access level.
 * `undefined` while loading, otherwise "admin" | "staff" | "none".
 */
export function useAccess(): AccessLevel | undefined {
  return useQuery(api.users.myAccess, {});
}
