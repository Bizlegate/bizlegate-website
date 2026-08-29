import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { CheckCircle2 } from "lucide-react";
import { useContentGetter, useMediaValue } from "@/hooks/use-content.ts";
import {
  BOOK_VALUE_ITEMS,
  BOOK_PERSONA_EXEC_KEY,
  BOOK_PERSONA_EXEC_DEFAULT,
} from "../_lib/book-data.ts";

export default function BookValueStack() {
  const get = useContentGetter();
  const exec = useMediaValue(BOOK_PERSONA_EXEC_KEY, BOOK_PERSONA_EXEC_DEFAULT);

  return (
    <Section className="bg-background">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div className="mx-auto w-full max-w-xs lg:max-w-md">
          <img
            src={exec.url}
            alt="An executive who has learned how the room actually works"
            className="w-full rounded-xl shadow-2xl"
          />
          <p className="mt-6 max-w-xs text-center text-sm italic text-muted-foreground lg:text-left">
            Written for the executive you're becoming.
          </p>
        </div>

        <div>
          <SectionHeading
            eyebrow="What's Inside"
            title="Everything you get."
            align="left"
            className="mx-0"
          />
          <div className="mt-10 space-y-8">
            {BOOK_VALUE_ITEMS.map((item) => (
              <div key={item.key} className="flex gap-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {get(`book.value.${item.key}.title`, item.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {get(`book.value.${item.key}.body`, item.body)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
