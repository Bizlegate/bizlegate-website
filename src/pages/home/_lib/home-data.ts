import { Compass, UserSearch, MailX, Unlink } from "lucide-react";
import { Camera, PlaneTakeoff, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const HERO_DEFAULTS = {
  eyebrow: "US · Taiwan",
  title: "The elite gateway to Taiwan business.",
  subtitle:
    "Bizlegate is a premier US–Taiwan business travel architecture firm. We anchor high-stakes corporate visits and curate quiet-luxury living, so your delegation moves with confidence from touchdown to takeoff.",
  tagline: "Direct Access. Lean Execution. Effortless Comfort.",
  imageUrl:
    "https://images.unsplash.com/photo-1565338259873-8df7c4498c4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
};

export type HomeCard = {
  icon: LucideIcon;
  key: string;
  title: string;
  body: string;
};

export const PAIN_POINTS: HomeCard[] = [
  {
    // zh copy (as of 2026-10-09) is about filtering/vetting partners and not
    // knowing who to contact or how to reach them — UserSearch (was Compass).
    icon: UserSearch,
    key: "unfamiliar",
    title: "You don't know where to knock.",
    body: "Taiwan's institutional landscape is opaque from the outside. Without the right door and the right introduction, even a well-funded visit stalls before it starts.",
  },
  {
    // zh copy (as of 2026-10-09) is no longer about language barriers — it's
    // about outreach going unanswered (don't know how to raise the other
    // side's willingness to accept a meeting; worried messages just sink
    // without a reply) — MailX (was Languages).
    icon: MailX,
    key: "language",
    title: "The English doesn't quite make sense.",
    body: "Local websites are technically in English, but the logic, structure, and intent get lost in translation. You're left guessing what any of it actually means.",
  },
  {
    // zh copy (as of 2026-10-09) is about superficial trade-show visits —
    // real decision-makers don't show up on the floor and there's little
    // follow-up after the event — Unlink (was CameraOff).
    icon: Unlink,
    key: "tradeshow",
    title: "Trade shows rarely deliver.",
    body: "You spend real money, but it's mostly for show. The decision-makers you came to meet don't walk the exhibition floor, and there's no follow-through afterward.",
  },
];

export const BENEFITS: HomeCard[] = [
  {
    icon: PlaneTakeoff,
    key: "savings",
    title: "Fewer people, lower cost",
    body: "Deploying a full entourage is obsolete. A single, trusted on-ground associate eliminates extensive travel overhead while ensuring your home-team operational continuity.",
  },
  {
    icon: Compass,
    key: "navigator",
    title: "Your local navigator",
    body: "A good leader puts the right person on the right task. When it comes to local arrangements, we effortlessly deliver insights that your colleagues simply can't reach.",
  },
  {
    icon: Users,
    key: "local",
    title: "Your most versatile associate",
    body: "We study your field and truly step into the role of your colleague, supporting your visits and meetings on the ground. And we confirm with you exactly what stays confidential, so nothing sensitive ever leaks.",
  },
  {
    icon: Camera,
    key: "photos",
    title: "Precious moments, captured",
    body: "Every milestone captured, zero visual compromise. We discreetly document your engagements with absolute consent, delivering high-caliber media that elevates your corporate narrative.",
  },
];
