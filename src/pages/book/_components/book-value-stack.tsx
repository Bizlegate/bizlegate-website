import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { CheckCircle2 } from "lucide-react";
import {
  useContentGetter,
  useContentText,
  useMediaValue,
} from "@/hooks/use-content.ts";
import {
  BOOK_VALUE_ITEMS,
  BOOK_VALUE_SECTION_DEFAULTS,
  BOOK_PERSONA_EXEC_KEY,
  BOOK_PERSONA_EXEC_DEFAULT,
  BOOK_VALUE_PERSONA_FRESHSTART_KEY,
  BOOK_VALUE_PERSONA_FRESHSTART_DEFAULT,
  BOOK_VALUE_PERSONA_TARGETED_KEY,
  BOOK_VALUE_PERSONA_TARGETED_DEFAULT,
} from "../_lib/book-data.ts";

/**
 * "Who it's for" audience-qualifier grid — repurposed 2026-10-26 from a
 * single big executive photo + generic "everything you get" feature
 * checklist into a 3-up grid of reader personas (first-time manager,
 * leader starting fresh at a new company, high performer targeted by
 * office politics), each with its own photo. The admin swaps each photo
 * individually from /admin → Content → Book once she has the right
 * scenario-specific image — all 3 default to the same placeholder photo
 * until then.
 *
 * The 3 useMediaValue calls below are fixed (one per persona) rather than
 * looped, because hooks can't run inside a .map() — BOOK_VALUE_ITEMS and
 * the photos array are zipped together afterward for rendering only.
 */
export default function BookValueStack() {
  const get = useContentGetter();
  const eyebrow = useContentText(
    "book.value.eyebrow",
    BOOK_VALUE_SECTION_DEFAULTS.eyebrow,
  );
  const title = useContentText(
    "book.value.title",
    BOOK_VALUE_SECTION_DEFAULTS.title,
  );

  const persona1Photo = useMediaValue(
    BOOK_PERSONA_EXEC_KEY,
    BOOK_PERSONA_EXEC_DEFAULT,
  );
  const persona2Photo = useMediaValue(
    BOOK_VALUE_PERSONA_FRESHSTART_KEY,
    BOOK_VALUE_PERSONA_FRESHSTART_DEFAULT,
  );
  const persona3Photo = useMediaValue(
    BOOK_VALUE_PERSONA_TARGETED_KEY,
    BOOK_VALUE_PERSONA_TARGETED_DEFAULT,
  );
  const photos = [persona1Photo, persona2Photo, persona3Photo];

  return (
    <Section className="bg-background">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="mt-12 grid gap-10 sm:grid-cols-3">
        {BOOK_VALUE_ITEMS.map((item, i) => {
          const itemTitle = get(`book.value.${item.key}.title`, item.title);
          return (
            <div
              key={item.key}
              className="flex flex-col items-center text-center"
            >
              <img
                src={photos[i].url}
                alt={itemTitle}
                // 8/5 is exactly half the height of the original 4/5
                // portrait frame at the same width — landscape instead of
                // portrait, per 2026-10-26 request.
                className="aspect-[8/5] w-full rounded-xl object-cover shadow-xl"
              />
              <div className="mt-5 flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                {itemTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {get(`book.value.${item.key}.body`, item.body)}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
