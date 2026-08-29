import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";

export default function ServicesCta() {
  const title = useContentText(
    "services.cta.title",
    "Tell us who you need to meet.",
  );
  const description = useContentText(
    "services.cta.description",
    "Share your objectives and we'll architect the visit around them. Every engagement begins with a confidential conversation.",
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
              Request Access <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
