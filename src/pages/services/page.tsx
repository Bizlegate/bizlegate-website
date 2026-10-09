import { Section } from "@/components/layout/section.tsx";
import { useContentGetter, useEffectiveLang } from "@/hooks/use-content.ts";
import ServicesHero from "./_components/services-hero.tsx";
import ServiceBlock from "./_components/service-block.tsx";
import ServicesCta from "./_components/services-cta.tsx";
import { SERVICES } from "./_lib/services-data.ts";

export default function Services() {
  const get = useContentGetter();
  const lang = useEffectiveLang();
  // Cultural tours and the dining experience aren't offered to the
  // Chinese-speaking audience (2026-10-09) — English is unaffected. See the
  // hideInZh doc comment on ServiceData in services-data.ts.
  const visibleServices =
    lang === "zh" ? SERVICES.filter((s) => !s.hideInZh) : SERVICES;

  return (
    <>
      <ServicesHero />
      <Section className="bg-background">
        <div className="space-y-20 sm:space-y-28">
          {visibleServices.map((service, index) => (
            <ServiceBlock
              key={service.baseKey}
              baseKey={service.baseKey}
              index={index}
              eyebrow={service.eyebrow}
              title={service.title}
              description={service.description}
              bullets={service.bullets}
              image={service.image}
              imageAlt={service.imageAlt}
              gallery={service.gallery}
              get={get}
            />
          ))}
        </div>
      </Section>
      <ServicesCta />
    </>
  );
}
