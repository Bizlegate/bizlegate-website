import { type MediaValue } from "@/hooks/use-content.ts";

/**
 * Static fallback copy for the /book sales page (Be the Outsmarter).
 * Every string here is a code-level default — the admin can override any of
 * them from /admin → Content → Book. This page is English-only / US-market
 * only by design (see the revenue plan), so it does NOT participate in the
 * zh bilingual system the way the rest of the site does.
 */

export const BOOK_COVER_KEY = "book.hero.cover";

export const BOOK_COVER_DEFAULT: MediaValue = {
  // Self-hosted fallback (see public/book-cover.webp). Swappable from
  // /admin → Content → Book without touching code, same pattern as the
  // site logo (see src/lib/branding.ts).
  url: "/book-cover.webp",
  type: "image",
};

// "Office Original" cast photos used to give the value-stack and structure
// sections a human face instead of icon-only cards. All swappable from
// /admin → Content → Book without touching code.
//
// BOOK_PERSONA_EXEC_KEY is the first of 3 persona photo slots in the
// "who it's for" qualifier grid (see BookValueStack, repurposed 2026-10-26
// from a single big photo + generic feature checklist). Kept its original
// key/name so any photo already uploaded there carries over as persona 1
// instead of being orphaned; the other two personas are new keys below.
export const BOOK_PERSONA_EXEC_KEY = "book.value.persona.exec";
export const BOOK_PERSONA_EXEC_DEFAULT: MediaValue = {
  url: "/book/persona-exec.webp",
  type: "image",
};

export const BOOK_VALUE_PERSONA_FRESHSTART_KEY =
  "book.value.persona.freshStart";
export const BOOK_VALUE_PERSONA_FRESHSTART_DEFAULT: MediaValue = {
  // Placeholder only — same stock photo as persona 1 until the admin
  // uploads a scenario-specific photo for this persona from /admin.
  url: "/book/persona-exec.webp",
  type: "image",
};

export const BOOK_VALUE_PERSONA_TARGETED_KEY = "book.value.persona.targeted";
export const BOOK_VALUE_PERSONA_TARGETED_DEFAULT: MediaValue = {
  url: "/book/persona-exec.webp",
  type: "image",
};

export const BOOK_PERSONA_TANAKA_KEY = "book.structure.persona.tanaka";
export const BOOK_PERSONA_TANAKA_DEFAULT: MediaValue = {
  url: "/book/persona-tanaka.webp",
  type: "image",
};

export const BOOK_PERSONA_FRUSTRATED_KEY = "book.structure.persona.frustrated";
export const BOOK_PERSONA_FRUSTRATED_DEFAULT: MediaValue = {
  url: "/book/persona-frustrated.webp",
  type: "image",
};

export const BOOK_HERO_DEFAULTS = {
  eyebrow: "Office Original Presents",
  title: "Be the Outsmarter",
  subtitle:
    "The office politics playbook for the executive who was never taught how power actually works.",
  price: "$45.00",
  // Fixed 2026-10-26: this used to say "Instant download", which
  // contradicted how the book is actually delivered (online reading at
  // bizlegate.com/library via email + access code — see book-tiers.tsx's
  // "no download, no app" copy, which was already accurate). Matches that
  // existing wording so the page says the same thing everywhere.
  priceNote: "Instant Access · Read Online at bizlegate.com/library",
  buyLabel: "Get the E-Book Now",
};

// Sale price shown struck-through-and-replaced next to the regular price.
// Empty string = no sale running — the site shows only the regular price
// everywhere. Every price display on the page (hero, final CTA, exit
// popups) picks this up automatically and highlights it (see PriceTag in
// price-tag.tsx). Defaults to the confirmed standing sale price, $42.39 —
// during a major holiday promotion, swap this one field to the deeper
// discount price ($34.69 was the confirmed example) from /admin, then
// change it back (or clear it) once the promotion ends.
export const BOOK_SALE_PRICE_KEY = "book.hero.salePrice";
export const BOOK_SALE_PRICE_DEFAULT = "$42.39";

// Section heading for the "who it's for" qualifier grid (see
// BookValueStack). Wired through the CMS (book.value.eyebrow /
// book.value.title) so the admin can edit it from /admin like everything
// else on this page — it was a hardcoded prop before 2026-10-26.
export const BOOK_VALUE_SECTION_DEFAULTS = {
  eyebrow: "Who It's For",
  title: "Is This Book for You? Read it if you are...",
};

// Repurposed 2026-10-26 from a generic 3-item "everything you get" feature
// list into 3 reader personas for the qualifier grid — see BookValueStack.
// Keys (playbook/cards/quotes) are unchanged from the old feature-list
// version on purpose: the admin has already saved her own title/body text
// for some of these from /admin, and renaming the keys would silently
// orphan that saved content. Only the default copy below changed.
export const BOOK_VALUE_ITEMS = [
  {
    key: "playbook",
    title: "The First-Time Manager",
    body: "A brand-new manager trying to figure out how to lead a team.",
  },
  {
    key: "cards",
    title: "The Leader Starting Fresh",
    body: "An experienced leader starting fresh at a new company.",
  },
  {
    key: "quotes",
    title: "The Target of the Politics",
    body: "A highly capable manager tired of dealing with toxic office factions, hidden agendas, and pushback from jealous colleagues.",
  },
] as const;

export const BOOK_STRUCTURE_DEFAULTS = {
  title: "Two operating layers, one book.",
  body: "Twenty chapters on the tactics — who to hire, how to build a team that doesn't run on goodwill alone, and how to read the room before it reads you. Ten more on the discipline most management books skip entirely: protecting your own mind, energy, and health well enough to still be standing when it matters.",
};

export const BOOK_STRUCTURE_LAYERS = [
  {
    key: "tactics",
    title: "Layer One — The Tactics",
    body: "Reading the room, building the team, playing the political game well enough to win it.",
  },
  {
    key: "discipline",
    title: "Layer Two — The Discipline",
    body: "Protecting your mind and energy well enough to still be standing when it matters.",
  },
] as const;

export const BOOK_QUOTE_DEFAULTS = {
  authorNote:
    "This book was written so you never have to sit through a three-hour lecture just to walk away with one useful insight.",
  takeaway:
    "Being an outsmarter means knowing how to play the game, how to play the man, and, most importantly, what we are playing for.",
};

export const BOOK_CONSULTING_DEFAULTS = {
  eyebrow: "Need More Than the Book?",
  // Was "Get a direct answer to your situation." — read as a guarantee of
  // resolution, which a few rounds of email can't always promise if the
  // first message doesn't give the full picture. Softened to describe what
  // is actually being sold (guidance, not a guaranteed fix).
  title: "Get thoughtful, specific guidance on your situation.",
  // Leads with privacy/discretion — for this audience (a difficult boss, a
  // reorg, office politics), being able to write it out privately instead
  // of saying it out loud on a call is a real advantage of the email
  // format, not just a scheduling convenience.
  subtitle:
    "Email-based guidance — private, on your own time, no calls to schedule. Write out what you're dealing with and get a thoughtful, specific reply back. No expiration on any pack.",
  note: "No time limit — use your replies whenever you need them. Each reply covers up to 3 questions.",
};

// Every tier carries both its regular price and its sale price — this page
// shows the SAME three tiers twice: once at regular price (BookConsulting,
// mid-page) and once at sale price (BookConsultingSale, the final push at
// the bottom of the page). See price-tag.tsx for how the two are rendered.
export const BOOK_CONSULTING_TIERS = [
  {
    key: "two",
    title: "Two-Pack",
    price: "$200",
    salePrice: "$198",
    body: "Two rounds of email exchange. For the one situation you need clarity on right now, plus a follow-up.",
  },
  {
    key: "five",
    title: "Five-Pack",
    price: "$490",
    salePrice: "$479",
    body: "Five rounds of email exchange. For working through a bigger decision over time.",
  },
  {
    key: "ten",
    title: "Ten-Pack",
    price: "$950",
    salePrice: "$936",
    body: "Ten rounds of email support. For ongoing guidance through a tough stretch — a new hire, a reorg, a difficult boss.",
  },
] as const;

export const BOOK_CONSULTING_CTA = "Get Started";

// Copy for the second consulting section — the sale-priced repeat of the
// same three tiers, placed at the very bottom of the page as the final
// push alongside the book's own sale-priced final CTA.
export const BOOK_CONSULTING_SALE_DEFAULTS = {
  eyebrow: "Limited-Time Pricing",
  title: "Lock in the discount.",
  subtitle:
    "Same guidance, same reply packs — at today's special price.",
};

// Two independent "don't lose the visitor" popups — see use-exit-intent.ts
// for exactly what triggers each one. Decided: the ONLY free content on
// this page is the Author's Note in full — no free chapter, ever. The
// other trigger opens the real "Office Politics Self-Diagnostic" quiz —
// see quiz-data.ts and book-quiz-dialog.tsx.
export const BOOK_EXIT_PREVIEW_DEFAULTS = {
  title: "Read the Author's Note — free.",
  body: "The full introduction, no email required. If it sounds like you, the book picks up right where this leaves off.",
  cta: "Get the Book",
};

// The confirmed, final Author's Note text (see project doc
// 11_author_note_preface.md). One entry per paragraph so the modal can
// render proper paragraph spacing instead of one unbroken block of text.
export const BOOK_AUTHOR_NOTE_PARAGRAPHS = [
  "I have always craved knowledge. Even as a young student, I consistently advanced ahead of the school curriculum. During classes, I was usually immersed in books of my own choosing, quietly hoping the teacher might introduce something new and draw me back to their teaching. In college, our university frequently invited prominent industry figures to speak, and I attended nearly every lecture. Back then, I felt a distinct divide between the academic ivory tower and the real business world, viewing each speaker as a window into practical operations and industry truths.",
  "However, after graduating and stepping into the corporate world, my attendance at such talks dropped sharply. When it came to management topics, I grew particularly dismissive. Most professional management trainers on the market have never actually worked their way up from entry-level positions to executive leadership. What they offer are merely secondhand stories gathered from conversations with corporate leaders, and lack the authentic trial-by-fire, the real pain points, and the decisive maneuvers forged in high-stakes executive play. These nuances involve critical commercial secrets that corporate executives would never disclose to outsiders.",
  "On occasion, to support a client or fulfill company obligations, I still had to attend certain lectures. By then, my expectations were minimal: if a three-hour talk yielded one insightful perspective, or even a useful sentence, I could at least tell myself it hadn't been a complete waste of time. Later, I pursued an Executive MBA. While the program provided robust governance frameworks and historical case studies, it still avoided the unspoken realities of corporate power, political maneuvering, and boardroom struggles, precisely where leaders need practical wisdom most.",
  "These courses disappoint us, in addressing the core challenges leaders face once stepping into power. Friends and family cannot comprehend our struggles, offering dismissive advice like \"just ignore them.\" Peers at our level are direct competitors, while superiors and subordinates share immediate conflicts of interest. Revealing our vulnerabilities to any side is interpreted as incompetence rather than authenticity. If we are lucky enough, we might encounter a mentor on our way up; otherwise, it's just brutal, we must buy our lessons through steep, personal costs.",
  "This book was written so you never have to sit through a three-hour lecture just to walk away with one useful insight. I have distilled the most concise, battle-tested strategies directly for you, ready for immediate application in your daily management challenges. Designed as an accessible desk reference rather than a theoretical text to be read once and shelved, this guide is meant to accompany you in your daily life by sitting on your office desk, in your briefcase, or on your nightstand. Whether you need swift guidance during high-pressure decisions or wish to reflect during brief moments in your day, it provides sharp, actionable wisdom rather than abstract lectures.",
  "These thirty chapters of strategic takeaways, forged in the real-world battleground, are the essential blueprint I wished I had early in my career. I dedicate them now to you, my dear readers, and wish you the best of luck in conquering your world.",
] as const;

export const BOOK_PREVIEW_DEFAULTS = {
  title: "Not ready to buy yet?",
  body: "Take the free 2-minute Office Politics Self-Diagnostic, or read the Author's Note in full before you decide.",
  cta: "Take the Free Diagnostic",
};

export const BOOK_CTA_DEFAULTS = {
  title: "Get the playbook.",
  // Same "instant download" → "instant access, read online" fix as
  // BOOK_HERO_DEFAULTS.priceNote above, for the same reason.
  body: "One-time purchase, instant access — read it online at bizlegate.com/library on your desk or your phone before your next meeting.",
};

// ---- Three-tier pricing (replaces the old single book price + separate
// consulting tiers — see claude/00_project_status.md, 2026-09-27 pricing
// pivot, and the 2026-09-27 follow-up removing the "Most Popular" styling).
// All three grant /library access; "full" reuses the existing
// BOOK_HERO_DEFAULTS.price / BOOK_SALE_PRICE_KEY pair (still $45 struck
// through to $42.39) rather than a new price field, since it's the same
// price this replaces. The other two are flat prices with their own CMS
// keys. The old consulting grid highlighted its middle tier with a "Most
// Popular" badge and raised card (see HIGHLIGHTED_TIER in the now-retired
// book-consulting.tsx) to nudge buyers toward it — deliberately dropped
// here per the client: she wants buyers comparing these three purely on
// their own merits, with no card visually favored over the others.
// `highlighted` is kept on the type/data (rather than deleted) in case a
// non-visual use for it shows up later, but book-tiers.tsx no longer reads
// it for styling.
// Introduces the Tier 3 wallpaper-library deliverable (see BookWallpaperIntro,
// added 2026-10-26) — placed right before the pricing tiers below because
// nothing earlier on the page explained what the wallpaper library actually
// is. The client supplied a reference mockup (a desktop + laptop on a desk
// showing sample wallpaper quotes, plus a few floating preview cards) —
// BOOK_WALLPAPER_INTRO_IMAGE_DEFAULT below reuses an existing book photo as
// a placeholder only; swap it for a real mockup/preview graphic from
// /admin → Content → Book.
export const BOOK_WALLPAPER_INTRO_IMAGE_KEY = "book.wallpaperIntro.image";
export const BOOK_WALLPAPER_INTRO_IMAGE_DEFAULT: MediaValue = {
  url: "/book/persona-exec.webp",
  type: "image",
};
export const BOOK_WALLPAPER_INTRO_DEFAULTS = {
  // Changed 2026-10-26 from "Exclusive To Tier 3" — the client wanted
  // wording that reads clearly as "bundle-only, not sold on its own"
  // without her having to know what "Tier 3" means.
  eyebrow: "Exclusive to Book Buyers",
  title: "A Wallpaper Library, Built to Keep You Grounded",
  body: "Packed with words of wisdom from this book and beyond, these wallpapers are a constant reminder to ground you — whether you're kicking off your morning, wrapping up your day, or switching between tasks in between. Unlimited access, included with the Complete Playbook + Wallpaper Library tier below.",
};

export const BOOK_TIER_SAMPLE_PRICE_KEY = "book.tier.sample.price";
export const BOOK_TIER_SAMPLE_PRICE_DEFAULT = "$10";
export const BOOK_TIER_DELUXE_PRICE_KEY = "book.tier.deluxe.price";
export const BOOK_TIER_DELUXE_PRICE_DEFAULT = "$83.59";

export const BOOK_TIERS_SECTION_DEFAULTS = {
  eyebrow: "Choose Your Format",
  title: "Get exactly what you need.",
  subtitle:
    "Every option unlocks online reading at bizlegate.com/library — no download, no app, sign in with your email and access code.",
};

// Deliberately NOT `as const` / a tuple — every entry shares one uniform
// shape (with priceKey/priceDefault left undefined for "full", which prices
// itself separately via useBookPrice() in book-tiers.tsx) so TypeScript
// treats BOOK_TIERS as a plain Tier[] and .map() doesn't need per-element
// discriminated-union narrowing to read `highlighted` / `priceKey`.
export type BookTier = {
  key: "sample" | "full" | "deluxe";
  title: string;
  body: string;
  highlighted: boolean;
  priceKey?: string;
  priceDefault?: string;
};

export const BOOK_TIERS: BookTier[] = [
  {
    key: "sample",
    title: "Two Key Chapters",
    body: "A taste of the playbook — two chapters, picked to stand on their own. Good for trying the book before committing to the whole thing.",
    highlighted: false,
    priceKey: BOOK_TIER_SAMPLE_PRICE_KEY,
    priceDefault: BOOK_TIER_SAMPLE_PRICE_DEFAULT,
  },
  {
    key: "full",
    title: "The Complete Playbook",
    body: "All 30 chapters — the full field manual, cover to cover.",
    // This tier's price is rendered separately via useBookPrice() (see
    // book-tiers.tsx), reusing the existing regular/sale price pair
    // instead of a flat one — priceKey/priceDefault stay unset.
    highlighted: false,
  },
  {
    key: "deluxe",
    // Repurposed 2026-10-26: this used to be a one-off desktop wallpaper
    // made by hand for each buyer (built around their own goal date). It's
    // now unlimited access to a shared, growing library of pre-made
    // reminder wallpapers instead — see wallpaperAccess in
    // convex/schema.ts/bookAccess.ts and the "Wallpapers" tab in
    // library-reader.tsx. Purpose, per the client: a visual reminder to
    // stay in a good state throughout the day — seen when you start work,
    // end work, and switch between tools in between.
    title: "Complete Playbook + Wallpaper Library",
    body: "All 30 chapters, plus unlimited access to a growing library of desktop reminder wallpapers — the words you need to see when you start your day, end it, or switch tasks in between.",
    highlighted: false,
    priceKey: BOOK_TIER_DELUXE_PRICE_KEY,
    priceDefault: BOOK_TIER_DELUXE_PRICE_DEFAULT,
  },
];

export const BOOK_TIERS_CTA = "Get Started";

// Was shared by "book-deluxe" and "wallpaper" — since the 2026-10-26 pivot
// to a shared pre-made wallpaper library, only the standalone /shop
// "wallpaper" item still collects these (book-deluxe just grants library
// access automatically, no per-buyer fields needed). Name kept as-is to
// avoid touching every import — see purchase-dialog.tsx.
export const BOOK_DELUXE_FORM_DEFAULTS = {
  goalDateLabel: "Your goal-achievement date",
  imageStyleLabel: "Desktop image style",
  imageStyleGlam: "With character artwork",
  imageStyleProfessional: "Professional only (no artwork)",
  noteLabel: "What are you working through right now?",
  notePlaceholder:
    "Tell us the situation you're in — this becomes your personalized reminder line.",
};
