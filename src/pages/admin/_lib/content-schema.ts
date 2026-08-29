import {
  HERO_DEFAULTS,
  PAIN_POINTS,
  BENEFITS,
} from "@/pages/home/_lib/home-data.ts";
import { SERVICES } from "@/pages/services/_lib/services-data.ts";
import { PROCESS_STEPS } from "@/pages/process/_lib/process-data.ts";
import {
  INQUIRE_FORM,
  INQUIRE_SUCCESS,
} from "@/pages/inquire/_lib/inquire-data.ts";
import { INTEREST_OPTIONS } from "@/pages/inquire/_lib/interests.ts";
import { LOGO_KEY, LOGO_DEFAULT } from "@/lib/branding.ts";
import { ZH_TRANSLATIONS } from "@/lib/zh-translations.ts";
import {
  BOOK_HERO_DEFAULTS,
  BOOK_VALUE_ITEMS,
  BOOK_STRUCTURE_DEFAULTS,
  BOOK_STRUCTURE_LAYERS,
  BOOK_QUOTE_DEFAULTS,
  BOOK_CONSULTING_DEFAULTS,
  BOOK_CONSULTING_TIERS,
  BOOK_CONSULTING_CTA,
  BOOK_CONSULTING_SALE_DEFAULTS,
  BOOK_EXIT_PREVIEW_DEFAULTS,
  BOOK_AUTHOR_NOTE_PARAGRAPHS,
  BOOK_SALE_PRICE_KEY,
  BOOK_SALE_PRICE_DEFAULT,
  BOOK_PREVIEW_DEFAULTS,
  BOOK_CTA_DEFAULTS,
  BOOK_COVER_KEY,
  BOOK_COVER_DEFAULT,
  BOOK_PERSONA_EXEC_KEY,
  BOOK_PERSONA_EXEC_DEFAULT,
  BOOK_PERSONA_TANAKA_KEY,
  BOOK_PERSONA_TANAKA_DEFAULT,
  BOOK_PERSONA_FRUSTRATED_KEY,
  BOOK_PERSONA_FRUSTRATED_DEFAULT,
} from "@/pages/book/_lib/book-data.ts";

export type TextFieldKind = "text" | "textarea";

export type TextField = {
  key: string;
  label: string;
  kind: TextFieldKind;
  fallback: string;
};

export type MediaField = {
  key: string;
  label: string;
  fallbackUrl: string;
};

export type FieldGroup = {
  title: string;
  description?: string;
  textFields: TextField[];
  mediaFields: MediaField[];
};

export type PageSchema = {
  id: string;
  label: string;
  groups: FieldGroup[];
};

/**
 * Central registry describing every editable text and media field on the site.
 * This drives the admin editor UI and stays in sync with the page components,
 * which read the same keys and defaults from their own data modules.
 */
export const PAGE_SCHEMAS: PageSchema[] = [
  {
    id: "branding",
    label: "Branding",
    groups: [
      {
        title: "Logo",
        description:
          "The logo shown in the site header and footer. Upload a new image (PNG with transparency works best) or paste an image URL. It updates everywhere instantly.",
        textFields: [],
        mediaFields: [
          {
            key: LOGO_KEY,
            label: "Site logo",
            fallbackUrl: LOGO_DEFAULT.url,
          },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    groups: [
      {
        title: "Hero",
        textFields: [
          {
            key: "home.hero.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: HERO_DEFAULTS.eyebrow,
          },
          {
            key: "home.hero.title",
            label: "Title",
            kind: "text",
            fallback: HERO_DEFAULTS.title,
          },
          {
            key: "home.hero.subtitle",
            label: "Subtitle",
            kind: "textarea",
            fallback: HERO_DEFAULTS.subtitle,
          },
          {
            key: "home.hero.tagline",
            label: "Tagline",
            kind: "text",
            fallback: HERO_DEFAULTS.tagline,
          },
        ],
        mediaFields: [
          {
            key: "home.hero.image",
            label: "Background image",
            fallbackUrl: HERO_DEFAULTS.imageUrl,
          },
        ],
      },
      {
        title: "Problem section",
        textFields: [
          {
            key: "home.pain.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: "The Problem",
          },
          {
            key: "home.pain.title",
            label: "Section title",
            kind: "text",
            fallback: "Breaking into Taiwan shouldn't be this hard.",
          },
          ...PAIN_POINTS.flatMap((p, i): TextField[] => [
            {
              key: `home.pain.${p.key}.title`,
              label: `Point ${i + 1} — Title`,
              kind: "text",
              fallback: p.title,
            },
            {
              key: `home.pain.${p.key}.body`,
              label: `Point ${i + 1} — Body`,
              kind: "textarea",
              fallback: p.body,
            },
          ]),
        ],
        mediaFields: [],
      },
      {
        title: "Local associate section",
        textFields: [
          {
            key: "home.guide.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: "You Have Me",
          },
          {
            key: "home.guide.title",
            label: "Section title",
            kind: "text",
            fallback: "Bizlegate, your local associate",
          },
          ...BENEFITS.flatMap((b, i): TextField[] => [
            {
              key: `home.guide.${b.key}.title`,
              label: `Benefit ${i + 1} — Title`,
              kind: "text",
              fallback: b.title,
            },
            {
              key: `home.guide.${b.key}.body`,
              label: `Benefit ${i + 1} — Body`,
              kind: "textarea",
              fallback: b.body,
            },
          ]),
        ],
        mediaFields: [],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    groups: [
      {
        title: "Services hero",
        textFields: [
          {
            key: "services.hero.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: "Our Services",
          },
          {
            key: "services.hero.title",
            label: "Title",
            kind: "text",
            fallback: "A complete architecture for the executive visit.",
          },
          {
            key: "services.hero.subtitle",
            label: "Subtitle",
            kind: "textarea",
            fallback:
              "From boardroom access to the quiet comforts of arrival, every element is engineered so your delegation performs at its best and leaves with relationships that last.",
          },
        ],
        mediaFields: [],
      },
      ...SERVICES.map(
        (service): FieldGroup => ({
          title: service.eyebrow,
          textFields: [
            {
              key: `${service.baseKey}.eyebrow`,
              label: "Eyebrow",
              kind: "text",
              fallback: service.eyebrow,
            },
            {
              key: `${service.baseKey}.title`,
              label: "Title",
              kind: "text",
              fallback: service.title,
            },
            {
              key: `${service.baseKey}.description`,
              label: "Description",
              kind: "textarea",
              fallback: service.description,
            },
            ...service.bullets.map(
              (b, i): TextField => ({
                key: `${service.baseKey}.${b.key}`,
                label: `Bullet ${i + 1}`,
                kind: "text",
                fallback: b.text,
              }),
            ),
          ],
          mediaFields: service.gallery
            ? service.gallery.map(
                (img, i): MediaField => ({
                  key: `${service.baseKey}.${img.key}`,
                  label: `Gallery image ${i + 1}`,
                  fallbackUrl: img.url,
                }),
              )
            : [
                {
                  key: `${service.baseKey}.image`,
                  label: "Image",
                  fallbackUrl: service.image.url,
                },
              ],
        }),
      ),
      {
        title: "Services call to action",
        textFields: [
          {
            key: "services.cta.title",
            label: "Title",
            kind: "text",
            fallback: "Tell us who you need to meet.",
          },
          {
            key: "services.cta.description",
            label: "Description",
            kind: "textarea",
            fallback:
              "Share your objectives and we'll architect the visit around them. Every engagement begins with a confidential conversation.",
          },
        ],
        mediaFields: [],
      },
    ],
  },
  {
    id: "process",
    label: "Process",
    groups: [
      {
        title: "Process hero",
        textFields: [
          {
            key: "process.hero.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: "How We Work",
          },
          {
            key: "process.hero.title",
            label: "Title",
            kind: "text",
            fallback:
              "A disciplined path from first contact to flawless execution.",
          },
          {
            key: "process.hero.subtitle",
            label: "Subtitle",
            kind: "textarea",
            fallback:
              "Every engagement follows a clear, confidential sequence. You always know where things stand, who is doing what, and what comes next.",
          },
        ],
        mediaFields: [],
      },
      {
        title: "Timeline steps",
        textFields: PROCESS_STEPS.flatMap((step, i): TextField[] => [
          {
            key: `${step.baseKey}.title`,
            label: `Step ${i + 1} — Title`,
            kind: "text",
            fallback: step.title,
          },
          {
            key: `${step.baseKey}.body`,
            label: `Step ${i + 1} — Body`,
            kind: "textarea",
            fallback: step.body,
          },
        ]),
        mediaFields: [],
      },
      {
        title: "Process call to action",
        textFields: [
          {
            key: "process.cta.title",
            label: "Title",
            kind: "text",
            fallback: "Ready to take the first step?",
          },
          {
            key: "process.cta.description",
            label: "Description",
            kind: "textarea",
            fallback:
              "It begins with a single, confidential conversation. Tell us what you want to achieve in Taiwan and we'll take care of the rest.",
          },
        ],
        mediaFields: [],
      },
    ],
  },
  {
    id: "inquire",
    label: "Inquire",
    groups: [
      {
        title: "Inquire hero",
        textFields: [
          {
            key: "inquire.hero.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: "Private Inquiry",
          },
          {
            key: "inquire.hero.title",
            label: "Title",
            kind: "text",
            fallback: "Let's design your visit.",
          },
          {
            key: "inquire.hero.subtitle",
            label: "Subtitle",
            kind: "textarea",
            fallback:
              "Share a few details and we will respond personally within one business day. Every inquiry is held in strict confidence.",
          },
        ],
        mediaFields: [],
      },
      {
        title: "Form fields & labels",
        description:
          "The labels and placeholder hints shown on each field of the inquiry form.",
        textFields: [
          {
            key: INQUIRE_FORM.fullName.labelKey,
            label: "Full name — label",
            kind: "text",
            fallback: INQUIRE_FORM.fullName.label,
          },
          {
            key: INQUIRE_FORM.fullName.placeholderKey,
            label: "Full name — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.fullName.placeholder,
          },
          {
            key: INQUIRE_FORM.organization.labelKey,
            label: "Organization — label",
            kind: "text",
            fallback: INQUIRE_FORM.organization.label,
          },
          {
            key: INQUIRE_FORM.organization.placeholderKey,
            label: "Organization — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.organization.placeholder,
          },
          {
            key: INQUIRE_FORM.title.labelKey,
            label: "Title — label",
            kind: "text",
            fallback: INQUIRE_FORM.title.label,
          },
          {
            key: INQUIRE_FORM.title.placeholderKey,
            label: "Title — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.title.placeholder,
          },
          {
            key: INQUIRE_FORM.email.labelKey,
            label: "Email — label",
            kind: "text",
            fallback: INQUIRE_FORM.email.label,
          },
          {
            key: INQUIRE_FORM.email.placeholderKey,
            label: "Email — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.email.placeholder,
          },
          {
            key: INQUIRE_FORM.email.descriptionKey,
            label: "Email — helper text",
            kind: "text",
            fallback: INQUIRE_FORM.email.description,
          },
          {
            key: INQUIRE_FORM.linkedin.labelKey,
            label: "LinkedIn — label",
            kind: "text",
            fallback: INQUIRE_FORM.linkedin.label,
          },
          {
            key: INQUIRE_FORM.linkedin.placeholderKey,
            label: "LinkedIn — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.linkedin.placeholder,
          },
          {
            key: INQUIRE_FORM.arrival.labelKey,
            label: "Arrival date — label",
            kind: "text",
            fallback: INQUIRE_FORM.arrival.label,
          },
          {
            key: INQUIRE_FORM.departure.labelKey,
            label: "Departure date — label",
            kind: "text",
            fallback: INQUIRE_FORM.departure.label,
          },
          {
            key: INQUIRE_FORM.datePlaceholder.key,
            label: "Date picker — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.datePlaceholder.text,
          },
          {
            key: INQUIRE_FORM.flexible.labelKey,
            label: "Flexible dates — label",
            kind: "text",
            fallback: INQUIRE_FORM.flexible.label,
          },
          {
            key: INQUIRE_FORM.partySize.labelKey,
            label: "Party size — label",
            kind: "text",
            fallback: INQUIRE_FORM.partySize.label,
          },
          {
            key: INQUIRE_FORM.partySize.placeholderKey,
            label: "Party size — placeholder",
            kind: "text",
            fallback: INQUIRE_FORM.partySize.placeholder,
          },
          {
            key: INQUIRE_FORM.interests.labelKey,
            label: "Areas of interest — label",
            kind: "text",
            fallback: INQUIRE_FORM.interests.label,
          },
          {
            key: INQUIRE_FORM.interests.descriptionKey,
            label: "Areas of interest — helper text",
            kind: "textarea",
            fallback: INQUIRE_FORM.interests.description,
          },
          {
            key: INQUIRE_FORM.objectives.labelKey,
            label: "Objectives — label",
            kind: "text",
            fallback: INQUIRE_FORM.objectives.label,
          },
          {
            key: INQUIRE_FORM.objectives.placeholderKey,
            label: "Objectives — placeholder",
            kind: "textarea",
            fallback: INQUIRE_FORM.objectives.placeholder,
          },
          {
            key: INQUIRE_FORM.privacy.key,
            label: "Confidentiality note",
            kind: "textarea",
            fallback: INQUIRE_FORM.privacy.text,
          },
          {
            key: INQUIRE_FORM.submit.key,
            label: "Submit button",
            kind: "text",
            fallback: INQUIRE_FORM.submit.text,
          },
        ],
        mediaFields: [],
      },
      {
        title: "Areas of interest — options",
        description:
          "The selectable interest tags shown on the form. Rename them here.",
        textFields: INTEREST_OPTIONS.map((option, i) => ({
          key: option.labelKey,
          label: `Option ${i + 1}`,
          kind: "text" as const,
          fallback: option.label,
        })),
        mediaFields: [],
      },
      {
        title: "Confirmation message",
        description: "Shown after a visitor submits the form.",
        textFields: [
          {
            key: INQUIRE_SUCCESS.title.key,
            label: "Title",
            kind: "text",
            fallback: INQUIRE_SUCCESS.title.text,
          },
          {
            key: INQUIRE_SUCCESS.body.key,
            label: "Message",
            kind: "textarea",
            fallback: INQUIRE_SUCCESS.body.text,
          },
        ],
        mediaFields: [],
      },
    ],
  },
  {
    id: "book",
    label: "Book",
    groups: [
      {
        title: "Hero",
        description:
          "The /book sales page is hidden behind the Book toggle above the language tabs until you turn it on. English-only — this page is not part of the Chinese site.",
        textFields: [
          {
            key: "book.hero.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: BOOK_HERO_DEFAULTS.eyebrow,
          },
          {
            key: "book.hero.title",
            label: "Title",
            kind: "text",
            fallback: BOOK_HERO_DEFAULTS.title,
          },
          {
            key: "book.hero.subtitle",
            label: "Subtitle",
            kind: "textarea",
            fallback: BOOK_HERO_DEFAULTS.subtitle,
          },
          {
            key: "book.hero.price",
            label: "Regular price",
            kind: "text",
            fallback: BOOK_HERO_DEFAULTS.price,
          },
          {
            key: BOOK_SALE_PRICE_KEY,
            label:
              "Sale price (shown everywhere, regular price struck through — leave blank to run regular price only). Swap to the deeper holiday-sale price during a major promotion, then change it back.",
            kind: "text",
            fallback: BOOK_SALE_PRICE_DEFAULT,
          },
          {
            key: "book.hero.priceNote",
            label: "Price note",
            kind: "text",
            fallback: BOOK_HERO_DEFAULTS.priceNote,
          },
          {
            key: "book.hero.buyLabel",
            label: "Buy button label",
            kind: "text",
            fallback: BOOK_HERO_DEFAULTS.buyLabel,
          },
        ],
        mediaFields: [
          {
            key: BOOK_COVER_KEY,
            label: "Book cover",
            fallbackUrl: BOOK_COVER_DEFAULT.url,
          },
        ],
      },
      {
        title: "Consulting service (3 tiers)",
        description:
          "The email-based 1:1 guidance offer. These three tiers appear TWICE on the page — at regular price mid-page, and again at sale price near the bottom (see the 'Consulting — sale section' group below) — title/body/regular-price/sale-price here are shared by both, only the sale section's own eyebrow/title/subtitle differ.",
        textFields: [
          {
            key: "book.consulting.eyebrow",
            label: "Eyebrow (regular-price section)",
            kind: "text",
            fallback: BOOK_CONSULTING_DEFAULTS.eyebrow,
          },
          {
            key: "book.consulting.title",
            label: "Section title (regular-price section)",
            kind: "text",
            fallback: BOOK_CONSULTING_DEFAULTS.title,
          },
          {
            key: "book.consulting.subtitle",
            label: "Section subtitle (regular-price section)",
            kind: "textarea",
            fallback: BOOK_CONSULTING_DEFAULTS.subtitle,
          },
          {
            key: "book.consulting.cta",
            label: "Buy button label (all tiers, both sections)",
            kind: "text",
            fallback: BOOK_CONSULTING_CTA,
          },
          ...BOOK_CONSULTING_TIERS.flatMap((tier, i): TextField[] => [
            {
              key: `book.consulting.${tier.key}.title`,
              label: `Tier ${i + 1} — Title`,
              kind: "text",
              fallback: tier.title,
            },
            {
              key: `book.consulting.${tier.key}.price`,
              label: `Tier ${i + 1} — Regular price`,
              kind: "text",
              fallback: tier.price,
            },
            {
              key: `book.consulting.${tier.key}.salePrice`,
              label: `Tier ${i + 1} — Sale price (shown in the bottom sale section)`,
              kind: "text",
              fallback: tier.salePrice,
            },
            {
              key: `book.consulting.${tier.key}.body`,
              label: `Tier ${i + 1} — Body`,
              kind: "textarea",
              fallback: tier.body,
            },
          ]),
          {
            key: "book.consulting.note",
            label: "Footnote (e.g. no expiration) — regular-price section only",
            kind: "text",
            fallback: BOOK_CONSULTING_DEFAULTS.note,
          },
        ],
        mediaFields: [],
      },
      {
        title: "Consulting — sale section (bottom of page)",
        description:
          "The same 3 tiers repeated at sale price as the final push, right after the book's own sale-priced final CTA. Only this section's own heading text lives here — the tiers' title/body/prices are edited in 'Consulting service (3 tiers)' above.",
        textFields: [
          {
            key: "book.consultingSale.eyebrow",
            label: "Eyebrow",
            kind: "text",
            fallback: BOOK_CONSULTING_SALE_DEFAULTS.eyebrow,
          },
          {
            key: "book.consultingSale.title",
            label: "Section title",
            kind: "text",
            fallback: BOOK_CONSULTING_SALE_DEFAULTS.title,
          },
          {
            key: "book.consultingSale.subtitle",
            label: "Section subtitle",
            kind: "textarea",
            fallback: BOOK_CONSULTING_SALE_DEFAULTS.subtitle,
          },
        ],
        mediaFields: [],
      },
      {
        title: "What's inside (value stack)",
        description:
          "The 'Office Original' cast photo shown beside this list.",
        textFields: BOOK_VALUE_ITEMS.flatMap((item, i): TextField[] => [
          {
            key: `book.value.${item.key}.title`,
            label: `Item ${i + 1} — Title`,
            kind: "text",
            fallback: item.title,
          },
          {
            key: `book.value.${item.key}.body`,
            label: `Item ${i + 1} — Body`,
            kind: "textarea",
            fallback: item.body,
          },
        ]),
        mediaFields: [
          {
            key: BOOK_PERSONA_EXEC_KEY,
            label: "Photo — the executive",
            fallbackUrl: BOOK_PERSONA_EXEC_DEFAULT.url,
          },
        ],
      },
      {
        title: "Structure & pull-quote",
        description:
          "The two layer cards show an 'Office Original' cast photo with a short caption, one per operating layer described below.",
        textFields: [
          {
            key: "book.structure.title",
            label: "Section title",
            kind: "text",
            fallback: BOOK_STRUCTURE_DEFAULTS.title,
          },
          {
            key: "book.structure.body",
            label: "Section body",
            kind: "textarea",
            fallback: BOOK_STRUCTURE_DEFAULTS.body,
          },
          ...BOOK_STRUCTURE_LAYERS.flatMap((layer, i): TextField[] => [
            {
              key: `book.structure.layer.${layer.key}.title`,
              label: `Layer ${i + 1} — Caption title`,
              kind: "text",
              fallback: layer.title,
            },
            {
              key: `book.structure.layer.${layer.key}.body`,
              label: `Layer ${i + 1} — Caption body`,
              kind: "textarea",
              fallback: layer.body,
            },
          ]),
          {
            key: "book.quote.authorNote",
            label: "Pull-quote (from Author's Note)",
            kind: "textarea",
            fallback: BOOK_QUOTE_DEFAULTS.authorNote,
          },
        ],
        mediaFields: [
          {
            key: BOOK_PERSONA_TANAKA_KEY,
            label: "Photo — Layer One (the tactics)",
            fallbackUrl: BOOK_PERSONA_TANAKA_DEFAULT.url,
          },
          {
            key: BOOK_PERSONA_FRUSTRATED_KEY,
            label: "Photo — Layer Two (the discipline)",
            fallbackUrl: BOOK_PERSONA_FRUSTRATED_DEFAULT.url,
          },
        ],
      },
      {
        title: "Free preview / diagnostic CTA",
        description:
          "This button opens the real Office Politics Self-Diagnostic quiz (5 questions → email → result). The quiz's own questions, results, and matching chapters aren't editable here — they live in src/pages/book/_lib/quiz-data.ts, since it's a structured multi-step flow rather than a few text fields.",
        textFields: [
          {
            key: "book.preview.title",
            label: "Title",
            kind: "text",
            fallback: BOOK_PREVIEW_DEFAULTS.title,
          },
          {
            key: "book.preview.body",
            label: "Body",
            kind: "textarea",
            fallback: BOOK_PREVIEW_DEFAULTS.body,
          },
          {
            key: "book.preview.cta",
            label: "Button label",
            kind: "text",
            fallback: BOOK_PREVIEW_DEFAULTS.cta,
          },
        ],
        mediaFields: [],
      },
      {
        title: "Final call to action",
        textFields: [
          {
            key: "book.cta.title",
            label: "Title",
            kind: "text",
            fallback: BOOK_CTA_DEFAULTS.title,
          },
          {
            key: "book.cta.body",
            label: "Body",
            kind: "textarea",
            fallback: BOOK_CTA_DEFAULTS.body,
          },
        ],
        mediaFields: [],
      },
      {
        title: "Exit-intent popups",
        description:
          "Two independent triggers, not a fixed 1st/2nd sequence — either can fire alone, and both retire permanently once a visitor clicks any 'Get the Book' button. 30s idle → the preview popup below (the Author's Note in full is the only free content on this page by design, no free chapter). A genuine attempt to leave (desktop: mouse toward the browser chrome; any device: cancelling out of the browser's own close/navigate-away prompt) → the Office Politics Self-Diagnostic quiz, a separate structured flow edited in quiz-data.ts, not here. See use-exit-intent.ts.",
        textFields: [
          {
            key: "book.exit.preview.title",
            label: "Preview popup (30s idle) — Title",
            kind: "text",
            fallback: BOOK_EXIT_PREVIEW_DEFAULTS.title,
          },
          {
            key: "book.exit.preview.body",
            label: "Preview popup (30s idle) — Intro line",
            kind: "textarea",
            fallback: BOOK_EXIT_PREVIEW_DEFAULTS.body,
          },
          {
            key: "book.exit.preview.cta",
            label: "Preview popup (30s idle) — Buy button label",
            kind: "text",
            fallback: BOOK_EXIT_PREVIEW_DEFAULTS.cta,
          },
          ...BOOK_AUTHOR_NOTE_PARAGRAPHS.map(
            (paragraph, i): TextField => ({
              key: `book.exit.authorNote.${i}`,
              label: `Author's Note — Paragraph ${i + 1}`,
              kind: "textarea",
              fallback: paragraph,
            }),
          ),
        ],
        mediaFields: [],
      },
    ],
  },
];

/**
 * Chinese (中文) edition of the same schema, generated automatically from
 * PAGE_SCHEMAS so both language tabs in /admin always have an identical
 * layout — same pages, same groups, same field order — without having to
 * hand-maintain two parallel copies.
 *
 * Every field's key gets a ".zh" suffix (e.g. "home.hero.title" becomes
 * "home.hero.title.zh"), which is a completely independent row in the CMS:
 * editing it here never touches the English content, and vice versa. Text
 * field fallbacks pull from the ZH_TRANSLATIONS draft dictionary (falling
 * back to the English default text if a key hasn't been translated yet).
 * Media (image) fields default to the same fallback image as the English
 * side until the admin uploads a Chinese-specific photo.
 */
function toZhKey(key: string): string {
  return `${key}.zh`;
}

function toZhTextField(field: TextField): TextField {
  return {
    ...field,
    key: toZhKey(field.key),
    fallback: ZH_TRANSLATIONS[field.key] ?? field.fallback,
  };
}

function toZhMediaField(field: MediaField): MediaField {
  return {
    ...field,
    key: toZhKey(field.key),
  };
}

function toZhGroup(group: FieldGroup): FieldGroup {
  return {
    ...group,
    textFields: group.textFields.map(toZhTextField),
    mediaFields: group.mediaFields.map(toZhMediaField),
  };
}

export const PAGE_SCHEMAS_ZH: PageSchema[] = PAGE_SCHEMAS.filter(
  (page) => page.id !== "book",
).map((page) => ({
  ...page,
  groups: page.groups.map(toZhGroup),
}));
