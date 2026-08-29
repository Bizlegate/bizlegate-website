import { type MediaValue } from "@/hooks/use-content.ts";

export type GalleryImage = {
  /** CMS key suffix, e.g. "image1" -> "services.living.image1" */
  key: string;
  url: string;
  alt: string;
};

export type ServiceData = {
  baseKey: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: { key: string; text: string }[];
  /** Single hero-style image (used when gallery is absent). */
  image: MediaValue;
  imageAlt: string;
  /** Optional 2x2 gallery of four images. When present, replaces the single image. */
  gallery?: GalleryImage[];
};

export const SERVICES: ServiceData[] = [
  {
    baseKey: "services.facilitation",
    eyebrow: "Professional Facilitation",
    title: "Meetings that reach the right people.",
    description:
      "We open the doors that matter, coordinating high-level introductions across industry, academia, and government so your objectives move forward with the people who can actually advance them.",
    bullets: [
      {
        key: "b1",
        text: "Curated introductions to industry leaders, investors, and decision-makers.",
      },
      {
        key: "b2",
        text: "Access to academic institutions, research centers, and government bodies.",
      },
      {
        key: "b3",
        text: "On-the-ground interpretation, briefing notes, and cultural guidance in every meeting.",
      },
      {
        key: "b4",
        text: "Follow-through coordination that keeps momentum long after you fly home.",
      },
    ],
    image: {
      url: "https://images.unsplash.com/photo-1569616724771-7abf027deca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      type: "image",
    },
    imageAlt: "Executives visiting a company",
  },
  {
    baseKey: "services.living",
    eyebrow: "Comfortable Living",
    title: "Arrive rested. Stay at your best.",
    description:
      "The hours outside the boardroom decide how you show up inside it. We handle lodging, transport, and wellbeing so nothing between meetings costs you focus or energy.",
    bullets: [
      {
        key: "b1",
        text: "Five-star lodging and private serviced residences, matched to your schedule.",
      },
      {
        key: "b2",
        text: "Discreet chauffeur service and door-to-door logistics.",
      },
      {
        key: "b3",
        text: "Priority executive health checks at leading Taiwanese hospitals.",
      },
      {
        key: "b4",
        text: "Championship golf and private recreation, arranged on request.",
      },
    ],
    image: {
      url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      type: "image",
    },
    imageAlt: "Luxury hotel suite",
    gallery: [
      {
        key: "image1",
        url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Five-star hotel suite",
      },
      {
        key: "image2",
        url: "https://images.unsplash.com/photo-1710343491609-0cbc6c14b92d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Private chauffeur service",
      },
      {
        key: "image3",
        url: "https://images.unsplash.com/photo-1758691461990-03b49d969495?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Executive health check consultation",
      },
      {
        key: "image4",
        url: "https://images.unsplash.com/photo-1606443192517-919653213206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Championship golf course",
      },
    ],
  },
  {
    baseKey: "services.culture",
    eyebrow: "Refined Cultural Tours",
    title: "Taiwan, understood from the inside.",
    description:
      "Relationships in Asia are built beyond the agenda. We curate cultural experiences that give your visit depth, warmth, and the shared moments that turn contacts into partners.",
    bullets: [
      {
        key: "b1",
        text: "Taipei 101 and the city's architectural landmarks, privately guided.",
      },
      {
        key: "b2",
        text: "The National Palace Museum and its imperial collections.",
      },
      {
        key: "b3",
        text: "Traditional tea ceremonies and artisan encounters.",
      },
      {
        key: "b4",
        text: "Quiet visits to Xingtian Temple and other places of heritage.",
      },
    ],
    image: {
      url: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      type: "image",
    },
    imageAlt: "Taipei 101 skyline",
    gallery: [
      {
        key: "image1",
        url: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Taipei 101 at night",
      },
      {
        key: "image2",
        url: "https://images.unsplash.com/photo-1556115908-233c785befbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Taipei city architecture",
      },
      {
        key: "image3",
        url: "https://images.unsplash.com/photo-1531969179221-3946e6b5a5e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Traditional tea ceremony",
      },
      {
        key: "image4",
        url: "https://images.unsplash.com/photo-1571555788467-71d9e3add426?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Taiwanese temple architecture",
      },
    ],
  },
  {
    baseKey: "services.cuisine",
    eyebrow: "Authentic Cuisine",
    title: "The table where deals warm up.",
    description:
      "From Michelin dining rooms to the night-market classics locals love, we design culinary experiences that impress your guests and reveal the real Taiwan.",
    bullets: [
      {
        key: "b1",
        text: "Reservations at Michelin-starred and destination restaurants.",
      },
      {
        key: "b2",
        text: "Private dining rooms suited to confidential conversation.",
      },
      {
        key: "b3",
        text: "Guided tastings of Taiwan's celebrated street food and local specialties.",
      },
      {
        key: "b4",
        text: "Dietary preferences and hosting etiquette handled in advance.",
      },
    ],
    image: {
      url: "https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      type: "image",
    },
    imageAlt: "Fine Taiwanese cuisine",
    gallery: [
      {
        key: "image1",
        url: "https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Chef plating a gourmet dish",
      },
      {
        key: "image2",
        url: "https://images.unsplash.com/photo-1574966739987-65e38db0f7ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Elegant private dining room",
      },
      {
        key: "image3",
        url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Plated fine dining course",
      },
      {
        key: "image4",
        url: "https://images.unsplash.com/photo-1535898331935-2d274aff0fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
        alt: "Taiwan night market street food",
      },
    ],
  },
];
