import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { useUiText } from "@/lib/ui-strings.ts";

export default function ProcessCta() {
  const beginInquiryLabel = useUiText("process", "beginYourInquiry");
  const title = useContentText(
    "process.cta.title",
    "Ready to take the first step?",
  );
  const description = useContentText(
    "process.cta.description",
    "It begins with a single, confidential conversation. Tell us what you want to achieve in Taiwan and we'll take care of the rest.",
  );

  return (
    <section className="bg-[#0A1B2A]">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          {description}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/inquire">
              {beginInquiryLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
