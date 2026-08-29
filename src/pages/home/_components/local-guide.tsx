import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentText, useContentGetter } from "@/hooks/use-content.ts";
import { useUiText } from "@/lib/ui-strings.ts";
import { BENEFITS } from "../_lib/home-data.ts";

export default function LocalGuide() {
  const get = useContentGetter();
  const seeHowLabel = useUiText("home", "seeHowWeServeYou");
  const eyebrow = useContentText("home.guide.eyebrow", "You Have Me");
  const title = useContentText(
    "home.guide.title",
    "Bizlegate, your local associate",
  );

  return (
    <section className="bg-[#0A1B2A]">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.key} className="flex gap-4">
                <div className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {get(`home.guide.${b.key}.title`, b.title)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    {get(`home.guide.${b.key}.body`, b.body)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/services">
              {seeHowLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
