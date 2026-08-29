import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { useContentText, useContentGetter } from "@/hooks/use-content.ts";
import { PAIN_POINTS } from "../_lib/home-data.ts";

export default function PainPoints() {
  const get = useContentGetter();
  const eyebrow = useContentText("home.pain.eyebrow", "The Problem");
  const title = useContentText(
    "home.pain.title",
    "Breaking into Taiwan shouldn't be this hard.",
  );

  return (
    <Section className="bg-background">
      <SectionHeading eyebrow={eyebrow} title={title} className="max-w-4xl" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PAIN_POINTS.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.key}
              className="group rounded-xl border border-border bg-card p-7 transition-shadow hover:shadow-md"
            >
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-card-foreground">
                {get(`home.pain.${point.key}.title`, point.title)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {get(`home.pain.${point.key}.body`, point.body)}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
