import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";

// Returns all editable text content as a { key: value } map.
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("content").collect();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  },
});

// Returns all editable media as a { key: { url, type } } map.
export const getAllMedia = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("media").collect();
    const map: Record<string, { url: string; type: string }> = {};
    for (const row of rows) {
      map[row.key] = { url: row.url, type: row.type };
    }
    return map;
  },
});

// Admin: create or update a text content entry.
export const setContent = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }
    return await ctx.db.insert("content", { key: args.key, value: args.value });
  },
});

// Admin: create or update a media entry.
export const setMedia = mutation({
  args: {
    key: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("youtube"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("media")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { url: args.url, type: args.type });
      return existing._id;
    }
    return await ctx.db.insert("media", {
      key: args.key,
      url: args.url,
      type: args.type,
    });
  },
});

// Admin: generate a short-lived upload URL for uploading a media file to
// Convex file storage.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Admin: after uploading a file to storage, save its permanent URL as a media
// entry for the given key.
export const setMediaFromStorage = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Uploaded file could not be found.",
      });
    }
    const existing = await ctx.db
      .query("media")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { url, type: args.type });
      return existing._id;
    }
    return await ctx.db.insert("media", { key: args.key, url, type: args.type });
  },
});

// Admin: reset a content or media entry back to its code default by deleting
// the override.
export const clearContent = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

export const clearMedia = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("media")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
