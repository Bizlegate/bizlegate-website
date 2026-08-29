import { useContentText } from "@/hooks/use-content.ts";

export default function ServicesHero() {
  const eyebrow = useContentText("services.hero.eyebrow", "Our Services");
  const title = useContentText(
    "services.hero.title",
    "A complete architecture for the executive visit.",
  );
  const subtitle = useContentText(
    "services.hero.subtitle",
    "From boardroom access to the quiet comforts of arrival, every element is engineered so your delegation performs at its best and leaves with relationships that last.",
  );

  return (
    <section className="relative overflow-hidden bg-[#0A1B2A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, #C5A059 0, transparent 42%), radial-gradient(circle at 88% 10%, #C5A059 0, transparent 38%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
