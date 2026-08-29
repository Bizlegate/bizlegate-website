import { Section } from "@/components/layout/section.tsx";
import { useContentGetter, useContentText, useMediaValue } from "@/hooks/use-content.ts";
import {
  BOOK_STRUCTURE_DEFAULTS,
  BOOK_STRUCTURE_LAYERS,
  BOOK_QUOTE_DEFAULTS,
  BOOK_PERSONA_TANAKA_KEY,
  BOOK_PERSONA_TANAKA_DEFAULT,
  BOOK_PERSONA_FRUSTRATED_KEY,
  BOOK_PERSONA_FRUSTRATED_DEFAULT,
} from "../_lib/book-data.ts";

const LAYER_IMAGES = {
  tactics: {
    key: BOOK_PERSONA_TANAKA_KEY,
    fallback: BOOK_PERSONA_TANAKA_DEFAULT,
    alt: "A team lead navigating the politics of the room",
    // Landscape source, centered crop already keeps the whole head in frame.
    objectPosition: "center",
  },
  discipline: {
    key: BOOK_PERSONA_FRUSTRATED_KEY,
    fallback: BOOK_PERSONA_FRUSTRATED_DEFAULT,
    alt: "An executive under the pressure the book prepares you for",
    // Tall portrait source cropped into a short landscape card. A plain
    // center crop lands mid-forehead and cuts off the top of the head; too
    // low a value (previously 12%) shows too much blank background above
    // the hairline. 28% lands the hairline right at the top edge of the
    // frame.
    objectPosition: "center 28%",
  },
} as const;

export default function BookStructure() {
  const get = useContentGetter();
  const title = useContentText(
    "book.structure.title",
    BOOK_STRUCTURE_DEFAULTS.title,
  );
  const body = useContentText(
    "book.structure.body",
    BOOK_STRUCTURE_DEFAULTS.body,
  );
  const authorNoteQuote = useContentText(
    "book.quote.authorNote",
    BOOK_QUOTE_DEFAULTS.authorNote,
  );
  const tacticsImage = useMediaValue(
    LAYER_IMAGES.tactics.key,
    LAYER_IMAGES.tactics.fallback,
  );
  const disciplineImage = useMediaValue(
    LAYER_IMAGES.discipline.key,
    LAYER_IMAGES.discipline.fallback,
  );

  return (
    <Section className="bg-secondary/40">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {body}
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
        {BOOK_STRUCTURE_LAYERS.map((layer) => {
          const image =
            layer.key === "tactics" ? tacticsImage : disciplineImage;
          const { alt, objectPosition } = LAYER_IMAGES[layer.key];
          return (
            <div
              key={layer.key}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={image.url}
                alt={alt}
                className="h-56 w-full object-cover"
                style={{ objectPosition }}
              />
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold text-card-foreground">
                  {get(`book.structure.layer.${layer.key}.title`, layer.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {get(`book.structure.layer.${layer.key}.body`, layer.body)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-14 max-w-3xl text-center">
        <blockquote className="mx-auto max-w-xl border-l-2 border-primary pl-6 text-left font-serif text-xl italic leading-relaxed text-foreground">
          "{authorNoteQuote}"
        </blockquote>
        <p className="mt-3 text-sm text-muted-foreground">
          — Author's Note, <em>Be the Outsmarter</em>
        </p>
      </div>
    </Section>
  );
}
