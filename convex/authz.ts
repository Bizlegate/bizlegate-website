import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Returns the currently authenticated user's row, or throws.
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "You must be signed in.",
    });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "User record not found.",
    });
  }
  return user;
}

// Only the site owner (admin) may pass. Used for editing content and managing
// team members.
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action.",
    });
  }
  return user;
}

// Admins and invited staff may pass. Used for viewing inquiries.
export async function requireInquiryAccess(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin" && user.role !== "staff") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have permission to view inquiries.",
    });
  }
  return user;
}
