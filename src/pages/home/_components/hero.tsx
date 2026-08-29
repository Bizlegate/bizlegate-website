import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { useMediaValue } from "@/hooks/use-content.ts";
import { useUiText } from "@/lib/ui-strings.ts";
import { HERO_DEFAULTS } from "../_lib/home-data.ts";

export default function Hero() {
  const requestAccessLabel = useUiText("nav", "requestAccess");
  const exploreServicesLabel = useUiText("home", "exploreServices");
  const eyebrow = useContentText("home.hero.eyebrow", HERO_DEFAULTS.eyebrow);
  const title = useContentText("home.hero.title", HERO_DEFAULTS.title);
  const subtitle = useContentText(
    "home.hero.subtitle",
    HERO_DEFAULTS.subtitle,
  );
  const tagline = useContentText("home.hero.tagline", HERO_DEFAULTS.tagline);
  const bg = useMediaValue("home.hero.image", {
    url: HERO_DEFAULTS.imageUrl,
    type: "image",
  });

  return (
    <section className="relative overflow-hidden bg-[#0A1B2A]">
      <img
        src={bg.url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B2A] via-[#0A1B2A]/90 to-[#0A1B2A]/40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, #C5A059 0, transparent 40%), radial-gradient(circle at 90% 0%, #C5A059 0, transparent 35%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white text-balance sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          {subtitle}
        </p>
        <p className="mt-6 font-serif text-lg italic text-primary sm:text-xl">
          {tagline}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link to="/inquire">
              {requestAccessLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/services">{exploreServicesLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
