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
export const BOOK_PERSONA_EXEC_KEY = "book.value.persona.exec";
export const BOOK_PERSONA_EXEC_DEFAULT: MediaValue = {
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
  priceNote: "One-time purchase. Instant download.",
  buyLabel: "Get the Book",
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

export const BOOK_VALUE_ITEMS = [
  {
    key: "playbook",
    title: "The Complete Playbook",
    body: "30 field-tested chapters covering who you let into your circle, how you build your team and systems, how you read the politics around you, and how you protect your own mind and energy while you're doing it.",
  },
  {
    key: "cards",
    title: "Chapter Quick-Reference Cards",
    body: "A one-page cheat sheet for every chapter — built for the five minutes before a high-stakes meeting, not for reading cover to cover.",
  },
  {
    key: "quotes",
    title: "Executive Takeaway Cards",
    body: "Every chapter's closing line, collected into a printable set you can keep on your desk.",
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
  title: "Get a direct answer to your situation.",
  subtitle:
    "Email-based guidance — no calls to schedule. Write out what you're dealing with and get a thoughtful, specific reply back. No expiration on any pack.",
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
  body: "One-time purchase, instant download, read it on your desk or your phone before your next meeting.",
};
