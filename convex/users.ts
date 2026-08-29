import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";

// The site owner(s), pinned in code. These emails always resolve to admin,
// regardless of database state or which deployment they sign in to.
const OWNER_EMAILS = new Set<string>(["lanaxhsu@gmail.com"]);

function normalizeEmail(email: string | undefined): string | undefined {
  return email?.trim().toLowerCase() || undefined;
}

function isOwnerEmail(email: string | undefined): boolean {
  return email !== undefined && OWNER_EMAILS.has(email);
}

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    const email = normalizeEmail(identity.email);

    // Determine what role this user should have.
    // 1. Pinned owner emails are always admin.
    // 2. The very first user to ever sign in becomes admin (fallback).
    // 3. Otherwise, check the invite allowlist for their email.
    const anyUser = await ctx.db.query("users").first();
    const isFirstUser = anyUser === null;

    const invite = email
      ? await ctx.db
          .query("allowlist")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique()
      : null;

    const grantedRole: "admin" | "staff" | "user" =
      isOwnerEmail(email) || isFirstUser
        ? "admin"
        : (invite?.role ?? "user");

    if (user !== null) {
      // Existing user: keep their role in sync. Owners are always promoted to
      // admin; invited members get their assigned role. Never downgrade an
      // owner or an existing admin.
      const shouldBeAdmin = isOwnerEmail(email) || user.role === "admin";
      const targetRole = shouldBeAdmin ? "admin" : grantedRole;
      if (user.role !== targetRole) {
        await ctx.db.patch(user._id, { role: targetRole });
      }
      return user._id;
    }

    // New identity: create the user with the granted role.
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      role: grantedRole,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Called getCurrentUser without authentication present",
      });
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  },
});

// Returns the current user's access level for the backend. `undefined` while
// loading, otherwise one of "admin" | "staff" | "none".
export const myAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return "none" as const;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user?.role === "admin") return "admin" as const;
    if (user?.role === "staff") return "staff" as const;
    return "none" as const;
  },
});

// Returns whether the currently authenticated user is an admin. Returns false
// when signed out so the UI can gate the admin dashboard safely.
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user?.role === "admin";
  },
});

// Admin: list all team members (admins + invited staff) plus pending invites
// who have not signed in yet.
export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const activeMembers = users
      .filter((u) => u.role === "admin" || u.role === "staff")
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role as "admin" | "staff",
        status: "active" as const,
        createdAt: u._creationTime,
      }));

    const activeEmails = new Set(
      activeMembers.map((m) => normalizeEmail(m.email)).filter(Boolean),
    );

    const invites = await ctx.db.query("allowlist").collect();
    const pendingInvites = invites
      .filter((i) => !activeEmails.has(i.email))
      .map((i) => ({
        _id: i._id,
        name: undefined,
        email: i.email,
        role: i.role,
        status: "pending" as const,
        createdAt: i._creationTime,
      }));

    return { activeMembers, pendingInvites };
  },
});

// Admin: invite a new team member by email. They gain access the next time
// they sign in with that email.
export const inviteMember = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const email = normalizeEmail(args.email);
    if (!email || !email.includes("@")) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a valid email address.",
      });
    }

    // If already an active member, just update their role.
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const existingInvite = await ctx.db
      .query("allowlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingInvite) {
      await ctx.db.patch(existingInvite._id, { role: args.role });
    } else {
      await ctx.db.insert("allowlist", {
        email,
        role: args.role,
        invitedByEmail: normalizeEmail(admin.email),
      });
    }

    // Sync an already-signed-in user's role immediately (never downgrade owner).
    if (existingUser && existingUser.role !== "admin") {
      await ctx.db.patch(existingUser._id, { role: args.role });
    }

    return null;
  },
});

// Admin: revoke a member's access. Removes their invite and downgrades any
// existing account to a plain user. The site owner cannot be removed.
export const revokeMember = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const email = normalizeEmail(args.email);
    if (!email) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid email address.",
      });
    }

    if (email === normalizeEmail(admin.email)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You cannot remove your own owner access.",
      });
    }

    const invite = await ctx.db
      .query("allowlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (invite) {
      await ctx.db.delete(invite._id);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (user && user.role !== "admin") {
      await ctx.db.patch(user._id, { role: "user" });
    }

    return null;
  },
});
