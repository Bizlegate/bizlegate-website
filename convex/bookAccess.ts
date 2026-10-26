import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./authz";
import { EN_CHAPTERS, ZH_CHAPTERS, type BookChapter } from "./bookContentData";

// Very forgiving email shape check — same pattern as quiz.ts. Real
// deliverability is handled downstream by Resend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Short code shown to a buyer after they submit a purchase notice, so they
// can add it as a note/message on the Wise payment — this, together with
// the buyer's name, is the actual key the admin reconciles a Wise/bank
// deposit against (added 2026-10-26; a Wise deposit shows the payer's name
// and amount, never an account number, so asking buyers for an account
// number wouldn't match anything the admin can actually see). Alphabet
// excludes 0/O/1/I so it reads back over email without ambiguity.
const REFERENCE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateReferenceCode(): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += REFERENCE_CODE_CHARS[Math.floor(Math.random() * REFERENCE_CODE_CHARS.length)];
  }
  return `BZ-${suffix}`;
}

const LANGUAGE = v.union(v.literal("en"), v.literal("zh"), v.literal("both"));
const CHAPTER_ACCESS = v.union(v.literal("sample"), v.literal("full"));
const IMAGE_STYLE = v.union(v.literal("glam"), v.literal("professional"));

// The original three book tiers (see claude/00_project_status.md, 2026-09-27
// pricing pivot) plus the Office Original merch items and pre-made bundles
// added in the 2026-10-09 /shop pivot. Every book-* tier grants /library
// access; they differ only in which chapters that access covers and (for
// "book-deluxe") whether it also unlocks the wallpaperAccess "Wallpapers"
// tab there — a shared pool of pre-made wallpapers the admin uploads once
// (see the `wallpapers` table in schema.ts), not a one-off hand-made image
// per buyer (that was the model before the 2026-10-26 pivot). The merch
// items (wallpaper, print-book, tiger-figurine, tail-ring) and the two
// bundles never grant /library access — they're hand-fulfilled and marked
// done via markNoticeFulfilled below. The standalone /shop "wallpaper" item
// is the one holdout still using the old hand-made goalDate/imageStyle/note
// flow (see WALLPAPER_PRODUCTS below) — it wasn't folded into the shared
// pool, by the client's choice. "bundle-starter"/"bundle-collector" are
// pre-made combination packages — the alternative to a shopping cart (see
// shop-data.ts); each is one purchasable product with one combined price,
// bought through the same flow as everything else, and what's actually
// inside a bundle is plain CMS text on the frontend, not tracked here at
// all.
const PRODUCT = v.union(
  v.literal("book-sample"),
  v.literal("book-full"),
  v.literal("book-deluxe"),
  v.literal("book-upgrade"),
  v.literal("wallpaper"),
  v.literal("print-book"),
  v.literal("tiger-figurine"),
  v.literal("tail-ring"),
  v.literal("bundle-starter"),
  v.literal("bundle-collector"),
);
type Product =
  | "book-sample"
  | "book-full"
  | "book-deluxe"
  | "book-upgrade"
  | "wallpaper"
  | "print-book"
  | "tiger-figurine"
  | "tail-ring"
  | "bundle-starter"
  | "bundle-collector";
type ChapterAccess = "sample" | "full";

const PRODUCT_LABEL: Record<Product, string> = {
  "book-sample": "Be the Outsmarter — Two Key Chapters ($10)",
  "book-full": "Be the Outsmarter — Full Book ($42.39)",
  "book-deluxe": "Be the Outsmarter — Full Book + Wallpaper Library ($83.59)",
  // Added 2026-10-26 — the "Get the full book" button a Tier 1 (sample)
  // reader sees inside /library, so they pay only the difference instead of
  // the full $42.39 again. grantAccess upserts by email, so granting
  // chapterAccess "full" here correctly upgrades their existing row rather
  // than creating a second one (see purchase-dialog.tsx / library-reader.tsx).
  "book-upgrade": "Be the Outsmarter — Upgrade to Full Book ($32.39)",
  wallpaper: "Office Original — Custom Desktop Wallpaper",
  "print-book": "Be the Outsmarter — Printed Copy",
  "tiger-figurine": "Office Original — 虎爺擺飾 (Tiger General Figurine)",
  "tail-ring": "Office Original — 尾戒 (Tail Ring)",
  "bundle-starter": "/shop — Starter Bundle",
  "bundle-collector": "/shop — Collector Bundle",
};

// Only the book-* tiers grant /library access — this is just which slice of
// it. A product with no entry here (any merch item) never grants access;
// the admin panel uses `product in CHAPTER_ACCESS_FOR_PRODUCT` to decide
// whether to show "Grant access" or "Mark fulfilled" for a pending notice.
const CHAPTER_ACCESS_FOR_PRODUCT: Partial<Record<Product, ChapterAccess>> = {
  "book-sample": "sample",
  "book-full": "full",
  "book-deluxe": "full",
  "book-upgrade": "full",
};

// Products that need the hand-made-wallpaper fields (goalDate, imageStyle,
// and a required note) collected on the purchase-notice form. Only the
// standalone /shop "wallpaper" item still works this way — "book-deluxe"
// moved to the shared pre-made wallpaper library (see wallpaperAccess on
// the bookAccess table) on 2026-10-26, so it no longer collects these.
const WALLPAPER_PRODUCTS: ReadonlySet<Product> = new Set(["wallpaper"]);

// Physical items that need a shipping address collected on the
// purchase-notice form (see claude/00_project_status.md, 2026-10-09). Both
// bundles are treated as physical too — each is expected to include at
// least one physical item (the exact contents are plain CMS text, not
// tracked here), so always collecting an address is the safe default.
const PHYSICAL_PRODUCTS: ReadonlySet<Product> = new Set([
  "print-book",
  "tiger-figurine",
  "tail-ring",
  "bundle-starter",
  "bundle-collector",
]);

// Fallback Wise "request money" links, used until an admin sets a
// bookPaymentLinks row for that product from /admin → Book Access. Safe to
// hardcode here — this file only runs on the Convex backend, never in the
// public site bundle (same reasoning as bookContentData.ts), so this never
// leaks to a page a visitor could load before submitting a purchase notice.
// Only "book-full" has a confirmed link so far (carried over from the
// single-tier price this replaced) — every other product needs its own
// fixed-amount Wise link created and pasted into the Book Access admin
// panel before it will show a "Pay now" button (until then, a buyer who
// picks one just sees "we'll email you shortly").
const DEFAULT_PAYMENT_LINKS: Partial<Record<Product, string>> = {
  "book-full": "https://wise.com/pay/r/IOIcililVJZeXeg",
};

// Which two chapters the $10 "book-sample" tier unlocks — admin-editable
// from /admin → Book Access (a plain comma-separated list of chapter
// numbers stored under this content key, reusing the site's generic
// content table) so the pair can change without a code deploy. Falls back
// to this placeholder pair until the admin sets the real ones.
const SAMPLE_CHAPTERS_KEY = "book.sample.chapterNumbers";
const SAMPLE_CHAPTERS_DEFAULT = "1,2";

async function getSampleChapterNumbers(
  ctx: QueryCtx | MutationCtx,
): Promise<number[]> {
  const row = await ctx.db
    .query("content")
    .withIndex("by_key", (q) => q.eq("key", SAMPLE_CHAPTERS_KEY))
    .unique();
  const raw = row?.value.trim() || SAMPLE_CHAPTERS_DEFAULT;
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Characters chosen to avoid look-alikes a buyer might mistype from an
// email (0/O, 1/I/l are excluded).
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateAccessCode(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    if (i === 4) code += "-";
  }
  return code;
}

// Returns the full chapter set for a language, then narrows it to just the
// configured sample pair when the grant is a "sample" access. Throws if the
// language isn't valid content (defensive — schema/union should already
// prevent this).
async function chaptersFor(
  ctx: QueryCtx | MutationCtx,
  language: "en" | "zh",
  chapterAccess: ChapterAccess,
): Promise<BookChapter[]> {
  const all = language === "en" ? EN_CHAPTERS : ZH_CHAPTERS;
  if (chapterAccess === "full") return all;
  const sampleNumbers = await getSampleChapterNumbers(ctx);
  return all.filter((c) => sampleNumbers.includes(c.number));
}

/**
 * Public: a buyer reports that they've sent the manual bank transfer for one
 * of the three book tiers and is waiting to be granted /library access. This
 * does NOT verify the deposit — the admin reconciles the bank/Wise statement
 * by hand. See claude/16_payment_processor_decision.md for why this is
 * manual.
 *
 * Returns the Wise payment link for the chosen product so the buyer can pay
 * right away — deliberately returned here rather than stored anywhere a
 * public page query would fetch it, so the link (which shows the account
 * holder's name — see 16_payment_processor_decision.md) is only ever seen
 * by someone who has already told us they intend to buy, never by a casual
 * site visitor or a search engine crawling the public pages.
 */
export const submitPurchaseNotice = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    note: v.optional(v.string()),
    product: PRODUCT,
    requestedLanguage: v.optional(LANGUAGE),
    goalDate: v.optional(v.string()),
    imageStyle: v.optional(IMAGE_STYLE),
    shippingAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!EMAIL_RE.test(email)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a valid email address.",
      });
    }
    // Required as of 2026-10-26 (used to be optional) — this is the
    // reconciliation key: a Wise/bank deposit shows the payer's name, so the
    // admin matches amount + this name (+ the referenceCode below) against
    // what actually lands in Wise. See claude/16_payment_processor_decision.md.
    const name = args.name?.trim() ?? "";
    if (!name) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter the name on the account you'll pay from.",
      });
    }
    if (WALLPAPER_PRODUCTS.has(args.product)) {
      if (!args.goalDate?.trim()) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Please share your goal-achievement date.",
        });
      }
      if (!args.imageStyle) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Please choose a style for your desktop image.",
        });
      }
      if (!args.note?.trim()) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Please tell us what you're working through right now.",
        });
      }
    }
    if (PHYSICAL_PRODUCTS.has(args.product) && !args.shippingAddress?.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a shipping address.",
      });
    }

    const includeWallpaperFields = WALLPAPER_PRODUCTS.has(args.product);
    const includeShipping = PHYSICAL_PRODUCTS.has(args.product);
    const referenceCode = generateReferenceCode();

    const id = await ctx.db.insert("bookPurchaseNotices", {
      email,
      name,
      note: args.note?.trim() || undefined,
      product: args.product,
      requestedLanguage: args.requestedLanguage,
      goalDate: includeWallpaperFields ? args.goalDate?.trim() : undefined,
      imageStyle: includeWallpaperFields ? args.imageStyle : undefined,
      shippingAddress: includeShipping ? args.shippingAddress?.trim() : undefined,
      referenceCode,
      status: "pending",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendPurchaseNoticeNotification,
      {
        email,
        name,
        note: args.note?.trim() || undefined,
        product: PRODUCT_LABEL[args.product],
        requestedLanguage: args.requestedLanguage,
        goalDate: includeWallpaperFields ? args.goalDate?.trim() : undefined,
        imageStyle: includeWallpaperFields ? args.imageStyle : undefined,
        shippingAddress: includeShipping ? args.shippingAddress?.trim() : undefined,
        referenceCode,
      },
    );

    const override = await ctx.db
      .query("bookPaymentLinks")
      .withIndex("by_product", (q) => q.eq("product", args.product))
      .unique();
    const wiseLink = override?.wiseLink ?? DEFAULT_PAYMENT_LINKS[args.product];

    return { noticeId: id, wiseLink, referenceCode };
  },
});

// Admin: list purchase notices, newest first. Optionally filter by status
// (e.g. just "pending" for the default admin view).
export const listPurchaseNotices = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("granted"),
        v.literal("fulfilled"),
        v.literal("dismissed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const all = await ctx.db
      .query("bookPurchaseNotices")
      .order("desc")
      .collect();
    return args.status ? all.filter((n) => n.status === args.status) : all;
  },
});

// Admin: dismiss a purchase notice without granting access (e.g. spam, or a
// duplicate submission from the same buyer).
export const dismissPurchaseNotice = mutation({
  args: { noticeId: v.id("bookPurchaseNotices") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.noticeId, { status: "dismissed" });
    return null;
  },
});

// Admin: mark a non-library notice (any merch item — wallpaper, print-book,
// tiger-figurine, tail-ring) as hand-fulfilled once the admin has shipped or
// delivered it themselves. Unlike grantAccess, this never sends an email —
// there's no automated delivery for a physical item or a hand-made
// wallpaper, so there's nothing to notify the buyer about from here.
export const markNoticeFulfilled = mutation({
  args: { noticeId: v.id("bookPurchaseNotices") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.noticeId, { status: "fulfilled" });
    return null;
  },
});

// Admin: grant (or re-grant) /library access to a buyer's email once the
// bank transfer has been confirmed by hand. Always issues a fresh code —
// simplest mental model, and doubles as "resend/reset" if a buyer loses
// their original code. If sourceNoticeId is given, marks that notice
// granted. Triggers the automatic access-code email to the BUYER.
export const grantAccess = mutation({
  args: {
    email: v.string(),
    language: LANGUAGE,
    // Defaults to "full" (comp copies and manual grants are almost always
    // the full book) — the admin panel passes "sample" explicitly when
    // granting from a book-sample purchase notice.
    chapterAccess: v.optional(CHAPTER_ACCESS),
    // Whether this grant also unlocks /library's "Wallpapers" tab — the
    // admin panel passes true automatically when granting from a
    // book-deluxe purchase notice, or the admin can tick it by hand for a
    // comp grant. Left unset on a re-grant (e.g. "resend code") preserves
    // whatever the existing grant already had, same as sourceNoticeId below
    // — so resending someone's code can never silently take their wallpaper
    // access away.
    wallpaperAccess: v.optional(v.boolean()),
    sourceNoticeId: v.optional(v.id("bookPurchaseNotices")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const email = normalizeEmail(args.email);
    if (!EMAIL_RE.test(email)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a valid email address.",
      });
    }

    const code = generateAccessCode();
    const chapterAccess: ChapterAccess = args.chapterAccess ?? "full";

    const existing = await ctx.db
      .query("bookAccess")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    const wallpaperAccess =
      args.wallpaperAccess ?? existing?.wallpaperAccess ?? false;

    if (existing) {
      await ctx.db.patch(existing._id, {
        code,
        language: args.language,
        chapterAccess,
        wallpaperAccess,
        active: true,
        sourceNoticeId: args.sourceNoticeId ?? existing.sourceNoticeId,
      });
    } else {
      await ctx.db.insert("bookAccess", {
        email,
        code,
        language: args.language,
        chapterAccess,
        wallpaperAccess,
        active: true,
        sourceNoticeId: args.sourceNoticeId,
      });
    }

    if (args.sourceNoticeId) {
      await ctx.db.patch(args.sourceNoticeId, { status: "granted" });
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendBookAccessEmail, {
      email,
      code,
      language: args.language,
      chapterAccess,
      wallpaperAccess,
    });

    return { email, code };
  },
});

// Admin: revoke a buyer's access (e.g. a chargeback, or a mistaken grant).
// Keeps the row (and history) but the code stops working immediately.
export const revokeAccess = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    const existing = await ctx.db
      .query("bookAccess")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { active: false });
    }
    return null;
  },
});

// Admin: list every access grant, newest first.
export const listGrants = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("bookAccess").order("desc").collect();
  },
});

// Admin: the current effective payment link per product — the admin's own
// override if one has been set, otherwise the hardcoded default. Lets the
// admin panel show what's actually in effect right now.
export const listPaymentLinks = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const overrides = await ctx.db.query("bookPaymentLinks").collect();
    const overrideByProduct = new Map(overrides.map((o) => [o.product, o]));
    const products: Product[] = [
      "book-sample",
      "book-full",
      "book-deluxe",
      "book-upgrade",
      "wallpaper",
      "print-book",
      "tiger-figurine",
      "tail-ring",
      "bundle-starter",
      "bundle-collector",
    ];
    return products.map((product) => {
      const override = overrideByProduct.get(product);
      return {
        product,
        label: PRODUCT_LABEL[product],
        wiseLink: override?.wiseLink ?? DEFAULT_PAYMENT_LINKS[product] ?? "",
        isOverride: override !== undefined,
      };
    });
  },
});

// Admin: set (or clear, with an empty string) the payment link override for
// a product. Takes effect immediately for the next purchase notice.
export const setPaymentLink = mutation({
  args: { product: PRODUCT, wiseLink: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const trimmed = args.wiseLink.trim();
    const existing = await ctx.db
      .query("bookPaymentLinks")
      .withIndex("by_product", (q) => q.eq("product", args.product))
      .unique();

    if (!trimmed) {
      if (existing) await ctx.db.delete(existing._id);
      return null;
    }

    if (existing) {
      await ctx.db.patch(existing._id, { wiseLink: trimmed });
    } else {
      await ctx.db.insert("bookPaymentLinks", {
        product: args.product,
        wiseLink: trimmed,
      });
    }
    return null;
  },
});

// Admin: read the current sample-tier chapter numbers (comma-separated,
// e.g. "1,2") and the default that's in effect until one is set.
export const getSampleChapterSetting = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const row = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", SAMPLE_CHAPTERS_KEY))
      .unique();
    return { value: row?.value ?? "", default: SAMPLE_CHAPTERS_DEFAULT };
  },
});

// Admin: set which chapter numbers the $10 sample tier unlocks (a plain
// comma-separated list, e.g. "5,12"). Empty clears the override and falls
// back to SAMPLE_CHAPTERS_DEFAULT.
export const setSampleChapterSetting = mutation({
  args: { value: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const trimmed = args.value.trim();
    const existing = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", SAMPLE_CHAPTERS_KEY))
      .unique();
    if (!trimmed) {
      if (existing) await ctx.db.delete(existing._id);
      return null;
    }
    if (existing) {
      await ctx.db.patch(existing._id, { value: trimmed });
    } else {
      await ctx.db.insert("content", { key: SAMPLE_CHAPTERS_KEY, value: trimmed });
    }
    return null;
  },
});

// Public: the /library login form calls this with what the buyer typed.
// Deliberately returns only {ok, language, chapterAccess} — never any book
// content, and never reveals *why* a check failed (wrong email vs wrong
// code vs revoked all look identical) so a wrong guess can't be used to
// enumerate valid buyer emails.
export const verifyAccess = query({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const code = args.code.trim().toUpperCase();
    const grant = await ctx.db
      .query("bookAccess")
      .withIndex("by_email_code", (q) => q.eq("email", email).eq("code", code))
      .unique();
    if (!grant || !grant.active) {
      return { ok: false as const };
    }
    return {
      ok: true as const,
      language: grant.language,
      chapterAccess: grant.chapterAccess ?? "full",
      wallpaperAccess: grant.wallpaperAccess ?? false,
    };
  },
});

// Public: the actual gated content read. Re-checks the grant on every call
// (no session token, no localStorage-trusted flag) so a revoked or
// mistyped credential can never pull real chapter text, and a buyer who
// only paid for one language — or the two-chapter sample — can never fetch
// more than that: the requested `language` must be exactly what the grant
// allows (or the grant must be "both"), and the returned chapters are
// narrowed to the sample pair unless the grant is "full".
export const getChapters = query({
  args: {
    email: v.string(),
    code: v.string(),
    language: v.union(v.literal("en"), v.literal("zh")),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const code = args.code.trim().toUpperCase();
    const grant = await ctx.db
      .query("bookAccess")
      .withIndex("by_email_code", (q) => q.eq("email", email).eq("code", code))
      .unique();

    if (!grant || !grant.active) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Invalid email or access code.",
      });
    }

    if (grant.language !== "both" && grant.language !== args.language) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Your access does not include this language edition.",
      });
    }

    return chaptersFor(ctx, args.language, grant.chapterAccess ?? "full");
  },
});

// Public: the gated wallpaper-library read, mirroring getChapters above —
// re-checks the grant on every call and throws unless it's active AND
// specifically has wallpaperAccess (a plain book-full buyer without the
// deluxe tier must never see this). Returns the whole shared pool; there's
// no per-buyer filtering since every wallpaper here is pre-made and open to
// anyone with access, not a one-off deliverable.
export const getWallpapers = query({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const code = args.code.trim().toUpperCase();
    const grant = await ctx.db
      .query("bookAccess")
      .withIndex("by_email_code", (q) => q.eq("email", email).eq("code", code))
      .unique();

    if (!grant || !grant.active || !grant.wallpaperAccess) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Your access does not include the wallpaper library.",
      });
    }

    const rows = await ctx.db.query("wallpapers").order("desc").collect();
    return rows.map((w) => ({ _id: w._id, url: w.url, label: w.label }));
  },
});

// Admin: list every pre-made wallpaper for the management UI at
// /admin → Book Access.
export const listWallpapersAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("wallpapers").order("desc").collect();
  },
});

// Admin: after uploading an image to storage (via content.generateUploadUrl
// — reused as-is, it's generic and not tied to the content/media tables),
// add it to the shared wallpaper pool.
export const addWallpaper = mutation({
  args: { storageId: v.id("_storage"), label: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Uploaded file could not be found.",
      });
    }
    return await ctx.db.insert("wallpapers", {
      storageId: args.storageId,
      url,
      label: args.label?.trim() || undefined,
    });
  },
});

// Admin: remove a wallpaper from the pool and delete its stored file.
export const removeWallpaper = mutation({
  args: { wallpaperId: v.id("wallpapers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.wallpaperId);
    if (row) {
      await ctx.storage.delete(row.storageId);
      await ctx.db.delete(args.wallpaperId);
    }
    return null;
  },
});
