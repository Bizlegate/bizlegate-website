import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";
import { EN_CHAPTERS, ZH_CHAPTERS } from "./bookContentData";

// Very forgiving email shape check — same pattern as quiz.ts. Real
// deliverability is handled downstream by Resend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGUAGE = v.union(v.literal("en"), v.literal("zh"), v.literal("both"));

const PRODUCT = v.union(
  v.literal("book"),
  v.literal("consulting-two"),
  v.literal("consulting-five"),
  v.literal("consulting-ten"),
);
type Product = "book" | "consulting-two" | "consulting-five" | "consulting-ten";

const PRODUCT_LABEL: Record<Product, string> = {
  book: "Be the Outsmarter (book)",
  "consulting-two": "Consulting — Two-Pack",
  "consulting-five": "Consulting — Five-Pack",
  "consulting-ten": "Consulting — Ten-Pack",
};

// Fallback Wise "request money" links, used until an admin sets a
// bookPaymentLinks row for that product from /admin → Book Access. Safe to
// hardcode here — this file only runs on the Convex backend, never in the
// public site bundle (same reasoning as bookContentData.ts), so this never
// leaks to a page a visitor could load before submitting a purchase notice.
const DEFAULT_PAYMENT_LINKS: Partial<Record<Product, string>> = {
  book: "https://wise.com/pay/r/IOIcililVJZeXeg",
};

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

// Returns the full chapter set for a language, or throws if that language
// isn't valid content (defensive — schema/union should already prevent this).
function chaptersFor(language: "en" | "zh") {
  return language === "en" ? EN_CHAPTERS : ZH_CHAPTERS;
}

/**
 * Public: a buyer reports that they've sent the manual bank transfer for the
 * book (and/or a consulting pack) and is waiting to be granted /library
 * access (book) or contacted to start their consulting exchange. This does
 * NOT verify the deposit — the admin reconciles the bank/Wise statement by
 * hand. See claude/16_payment_processor_decision.md for why this is manual.
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
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!EMAIL_RE.test(email)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a valid email address.",
      });
    }
    if (args.product === "book" && !args.requestedLanguage) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please choose which language edition you'd like.",
      });
    }

    const id = await ctx.db.insert("bookPurchaseNotices", {
      email,
      name: args.name?.trim() || undefined,
      note: args.note?.trim() || undefined,
      product: args.product,
      requestedLanguage: args.product === "book" ? args.requestedLanguage : undefined,
      status: "pending",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendPurchaseNoticeNotification,
      {
        email,
        name: args.name?.trim() || undefined,
        note: args.note?.trim() || undefined,
        product: PRODUCT_LABEL[args.product],
        requestedLanguage: args.requestedLanguage,
      },
    );

    const override = await ctx.db
      .query("bookPaymentLinks")
      .withIndex("by_product", (q) => q.eq("product", args.product))
      .unique();
    const wiseLink = override?.wiseLink ?? DEFAULT_PAYMENT_LINKS[args.product];

    return { noticeId: id, wiseLink };
  },
});

// Admin: list purchase notices, newest first. Optionally filter by status
// (e.g. just "pending" for the default admin view).
export const listPurchaseNotices = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("granted"), v.literal("dismissed"))) },
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

// Admin: grant (or re-grant) /library access to a buyer's email once the
// bank transfer has been confirmed by hand. Always issues a fresh code —
// simplest mental model, and doubles as "resend/reset" if a buyer loses
// their original code. If sourceNoticeId is given, marks that notice
// granted. Triggers the automatic access-code email to the BUYER.
export const grantAccess = mutation({
  args: {
    email: v.string(),
    language: LANGUAGE,
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

    const existing = await ctx.db
      .query("bookAccess")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        code,
        language: args.language,
        active: true,
        sourceNoticeId: args.sourceNoticeId ?? existing.sourceNoticeId,
      });
    } else {
      await ctx.db.insert("bookAccess", {
        email,
        code,
        language: args.language,
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
      "book",
      "consulting-two",
      "consulting-five",
      "consulting-ten",
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

// Public: the /library login form calls this with what the buyer typed.
// Deliberately returns only {ok, language} — never any book content, and
// never reveals *why* a check failed (wrong email vs wrong code vs revoked
// all look identical) so a wrong guess can't be used to enumerate valid
// buyer emails.
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
    return { ok: true as const, language: grant.language };
  },
});

// Public: the actual gated content read. Re-checks the grant on every call
// (no session token, no localStorage-trusted flag) so a revoked or
// mistyped credential can never pull real chapter text, and a buyer who
// only paid for one language can never fetch the other — the requested
// `language` must be exactly what the grant allows (or the grant must be
// "both").
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

    return chaptersFor(args.language);
  },
});
