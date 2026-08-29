import { Section } from "@/components/layout/section.tsx";
import { useContentGetter } from "@/hooks/use-content.ts";
import ServicesHero from "./_components/services-hero.tsx";
import ServiceBlock from "./_components/service-block.tsx";
import ServicesCta from "./_components/services-cta.tsx";
import { SERVICES } from "./_lib/services-data.ts";

export default function Services() {
  const get = useContentGetter();

  return (
    <>
      <ServicesHero />
      <Section className="bg-background">
        <div className="space-y-20 sm:space-y-28">
          {SERVICES.map((service, index) => (
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
