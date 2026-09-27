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

  // A buyer's notice that they've sent a manual bank transfer for the book
  // (and/or a consulting pack) and are waiting for the admin to verify the
  // deposit and grant access. See convex/bookAccess.ts.
  bookPurchaseNotices: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    // What the buyer says they paid for / how much — free text, since this
    // is manually reconciled by the admin against the actual bank deposit,
    // not trusted or auto-charged.
    note: v.optional(v.string()),
    // Which reading-language access the buyer is requesting. "both" covers
    // someone who bought both language editions (or a consulting pack that
    // bundles both).
    requestedLanguage: v.union(
      v.literal("en"),
      v.literal("zh"),
      v.literal("both"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("granted"),
      v.literal("dismissed"),
    ),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Grants access to the gated /library online-reading page. One row per
  // buyer email. `language` is fixed at grant time by the admin to match
  // what was actually paid for — the reading page never exposes a language
  // the buyer didn't pay for (see 16_payment_processor_decision.md).
  bookAccess: defineTable({
    email: v.string(),
    code: v.string(),
    language: v.union(v.literal("en"), v.literal("zh"), v.literal("both")),
    active: v.boolean(),
    // The purchase notice this grant was issued from, if any (manual grants
    // made without a prior notice — e.g. a comp copy — can omit this).
    sourceNoticeId: v.optional(v.id("bookPurchaseNotices")),
  })
    .index("by_email", ["email"])
    .index("by_email_code", ["email", "code"]),
});
