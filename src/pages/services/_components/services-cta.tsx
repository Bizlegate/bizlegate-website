import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { useUiText } from "@/lib/ui-strings.ts";

export default function ServicesCta() {
  // Reuses the same "Request Access" / "立即諮詢" label already defined for
  // the navbar (UI_STRINGS.nav.requestAccess) rather than inventing a new
  // one — this button was hardcoded in English only before, so it never
  // translated on the zh site (2026-10-09 fix).
  const requestAccessLabel = useUiText("nav", "requestAccess");
  const title = useContentText(
    "services.cta.title",
    "Tell us who you need to meet.",
  );
  const description = useContentText(
    "services.cta.description",
    "Share your objectives and we'll architect the visit around them. Every engagement begins with a confidential conversation.",
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
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          {description}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/inquire">
              {requestAccessLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
