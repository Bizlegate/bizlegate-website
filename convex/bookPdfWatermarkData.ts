// Database-touching half of the PDF-keepsake watermarking feature — split
// out from convex/bookPdfWatermark.ts because Convex does not allow a
// query/mutation to live in a "use node" file (only actions can run in the
// Node.js runtime); bookPdfWatermark.ts needs "use node" for pdf-lib and
// fetch(), so these internalQuery/internalMutation functions, which need
// direct ctx.db access, have to live here instead and get called via
// ctx.runQuery/ctx.runMutation from that file's action.

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

const BOOK_PDF_LANGUAGE = v.union(v.literal("en"), v.literal("zh"));

// Internal: re-checks the buyer's grant exactly like getChapters/
// getBookPages in bookAccess.ts do (active, has the add-on, language
// covered), then looks up the master (un-watermarked) file for that
// language. Returns the grant's normalized email too, since the public
// action in bookPdfWatermark.ts needs it for the watermark text and the
// download-cache key.
export const checkPdfGrant = internalQuery({
  args: {
    email: v.string(),
    code: v.string(),
    language: BOOK_PDF_LANGUAGE,
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const code = args.code.trim().toUpperCase();
    const grant = await ctx.db
      .query("bookAccess")
      .withIndex("by_email_code", (q) => q.eq("email", email).eq("code", code))
      .unique();

    if (!grant || !grant.active || !grant.pdfAccess) {
      return { ok: false as const };
    }
    if (grant.language !== "both" && grant.language !== args.language) {
      return { ok: false as const };
    }

    const master = await ctx.db
      .query("bookPdfFiles")
      .withIndex("by_language", (q) => q.eq("language", args.language))
      .unique();

    return { ok: true as const, email, masterUrl: master?.url ?? null };
  },
});

// Internal: has this buyer already had a watermarked copy generated for
// this language? Avoids re-fetching, re-stamping, and re-storing the whole
// file every time they click "Download PDF" again.
export const getCachedWatermarkedCopy = internalQuery({
  args: { email: v.string(), language: BOOK_PDF_LANGUAGE },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("bookPdfDownloads")
      .withIndex("by_email_language", (q) =>
        q.eq("email", args.email).eq("language", args.language),
      )
      .unique();
    return row?.url ?? null;
  },
});

// Internal: record (or replace) this buyer's generated watermarked copy.
// Deletes the old stored file on replace so storage doesn't accumulate
// stale copies — mirrors saveBookPage/savePdfFile's upsert pattern.
export const saveWatermarkedCopy = internalMutation({
  args: {
    email: v.string(),
    language: BOOK_PDF_LANGUAGE,
    storageId: v.id("_storage"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookPdfDownloads")
      .withIndex("by_email_language", (q) =>
        q.eq("email", args.email).eq("language", args.language),
      )
      .unique();
    if (existing) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        url: args.url,
      });
    } else {
      await ctx.db.insert("bookPdfDownloads", args);
    }
    return null;
  },
});
