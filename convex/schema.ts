import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // Access levels:
    // - "admin": site owner. Full backend access + can invite/remove members.
    // - "staff": invited team member. Can view inquiries only.
    // - "user": signed in but not granted any backend access.
    role: v.optional(
      v.union(v.literal("admin"), v.literal("staff"), v.literal("user")),
    ),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Pre-approved team member emails. When someone signs in with an email on
  // this list they are granted the assigned role automatically.
  allowlist: defineTable({
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    invitedByEmail: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Editable text snippets keyed by a stable string (e.g. "home.hero.title").
  content: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // Editable media (images / video files / youtube embeds) keyed by a stable string.
  media: defineTable({
    key: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("youtube"),
    ),
  }).index("by_key", ["key"]),

  // Intake form submissions from prospective clients.
  formSubmissions: defineTable({
    fullName: v.string(),
    organization: v.string(),
    title: v.string(),
    email: v.string(),
    linkedinUrl: v.optional(v.string()),
    arrivalDate: v.optional(v.string()),
    departureDate: v.optional(v.string()),
    dateFlexible: v.optional(v.boolean()),
    partySize: v.optional(v.number()),
    interests: v.array(v.string()),
    objectives: v.string(),
  }),

  // Leads captured from the /book page's "Office Politics Self-Diagnostic"
  // quiz. Email is required to unlock the result, so every row is a real
  // lead — see convex/quiz.ts.
  quizLeads: defineTable({
    email: v.string(),
    resultType: v.union(
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
      v.literal("D"),
    ),
    answers: v.array(v.string()),
  }).index("by_email", ["email"]),

  // A buyer's notice that they've sent a manual bank transfer and are
  // waiting for the admin to verify the deposit and act on it. See
  // convex/bookAccess.ts.
  bookPurchaseNotices: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    // What the buyer says they paid for / how much — free text, since this
    // is manually reconciled by the admin against the actual bank deposit,
    // not trusted or auto-charged. For book-deluxe/wallpaper this doubles as
    // the buyer's description of what they're working through (see goalDate
    // / imageStyle below).
    note: v.optional(v.string()),
    // Which /shop item this notice is for. "book-sample"/"book-full"/
    // "book-deluxe" are the original three book tiers — every one of them
    // leads to a bookAccess grant (/library access), just to a different
    // set of chapters (see CHAPTER_ACCESS_FOR_PRODUCT in bookAccess.ts).
    // "wallpaper"/"print-book"/"tiger-figurine"/"tail-ring" are the
    // Office Original merch items added in the 2026-10-09 /shop pivot (see
    // claude/00_project_status.md) — none of these grant /library access;
    // they're hand-fulfilled and marked done via markNoticeFulfilled below.
    // "bundle-starter"/"bundle-collector" are pre-made combination packages
    // (added the same day, as the alternative to a shopping cart) — each is
    // its own single purchasable product with one combined price, bought
    // through the exact same flow as everything else; which items are
    // actually inside a bundle is plain CMS text, not tracked here.
    product: v.union(
      v.literal("book-sample"),
      v.literal("book-full"),
      v.literal("book-deluxe"),
      v.literal("wallpaper"),
      v.literal("print-book"),
      v.literal("tiger-figurine"),
      v.literal("tail-ring"),
      v.literal("bundle-starter"),
      v.literal("bundle-collector"),
    ),
    // Which reading-language access the buyer is requesting — "both"
    // covers someone who bought both language editions. Only meaningful for
    // the book-* products.
    requestedLanguage: v.optional(
      v.union(v.literal("en"), v.literal("zh"), v.literal("both")),
    ),
    // book-deluxe and wallpaper only: the buyer's target/goal-achievement
    // date and which visual style they want for the custom desktop
    // wallpaper. The admin makes the wallpaper by hand from these plus the
    // `note` field above — there's no automated generation or delivery
    // pipeline for it.
    goalDate: v.optional(v.string()),
    imageStyle: v.optional(
      v.union(v.literal("glam"), v.literal("professional")),
    ),
    // Physical items only (print-book, tiger-figurine, tail-ring) — where to
    // ship the item. Collected on the same purchase-notice form rather than
    // a separate logistics flow (see claude/00_project_status.md,
    // 2026-10-09).
    shippingAddress: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("granted"),
      // Set by markNoticeFulfilled for a hand-fulfilled non-library order
      // (merch, or a comp/manual case) — distinct from "granted", which
      // specifically means a /library access code was issued.
      v.literal("fulfilled"),
      v.literal("dismissed"),
    ),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // The Wise "request money" link shown to a buyer right after they submit
  // a purchase notice for a given product — never rendered on any public
  // page, only returned by the submitPurchaseNotice mutation's response
  // (see bookAccess.ts). One row per product; admin-editable from /admin →
  // Book Access so the link can be rotated or a new item's link added
  // without a code deploy. A hardcoded fallback in bookAccess.ts covers the
  // case where no row exists yet for a product.
  bookPaymentLinks: defineTable({
    product: v.union(
      v.literal("book-sample"),
      v.literal("book-full"),
      v.literal("book-deluxe"),
      v.literal("wallpaper"),
      v.literal("print-book"),
      v.literal("tiger-figurine"),
      v.literal("tail-ring"),
      v.literal("bundle-starter"),
      v.literal("bundle-collector"),
    ),
    wiseLink: v.string(),
  }).index("by_product", ["product"]),

  // Grants access to the gated /library online-reading page. One row per
  // buyer email. `language` is fixed at grant time by the admin to match
  // what was actually paid for — the reading page never exposes a language
  // the buyer didn't pay for (see 16_payment_processor_decision.md).
  bookAccess: defineTable({
    email: v.string(),
    code: v.string(),
    language: v.union(v.literal("en"), v.literal("zh"), v.literal("both")),
    // Which chapters this grant unlocks — "sample" is the two-chapter
    // taster tier ($10, see SAMPLE_CHAPTERS_KEY in bookAccess.ts), "full"
    // is all 30 chapters (both the $42.39 and $83.59 tiers grant "full").
    // Optional so any row from before this field existed still validates —
    // treated as "full" in code when absent.
    chapterAccess: v.optional(
      v.union(v.literal("sample"), v.literal("full")),
    ),
    active: v.boolean(),
    // The purchase notice this grant was issued from, if any (manual grants
    // made without a prior notice — e.g. a comp copy — can omit this).
    sourceNoticeId: v.optional(v.id("bookPurchaseNotices")),
  })
    .index("by_email", ["email"])
    .index("by_email_code", ["email", "code"]),
});
