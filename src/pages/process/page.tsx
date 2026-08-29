import { Section } from "@/components/layout/section.tsx";
import { useContentGetter } from "@/hooks/use-content.ts";
import ProcessHero from "./_components/process-hero.tsx";
import ProcessTimeline from "./_components/process-timeline.tsx";
import ProcessCta from "./_components/process-cta.tsx";

export default function Process() {
  const get = useContentGetter();

  return (
    <>
      <ProcessHero />
      <Section className="bg-background">
        <ProcessTimeline get={get} />
      </Section>
      <ProcessCta />
    </>
  );
}
