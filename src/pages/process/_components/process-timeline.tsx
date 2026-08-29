import { PROCESS_STEPS } from "../_lib/process-data.ts";

type ProcessTimelineProps = {
  get: (key: string, fallback: string) => string;
};

/**
 * Vertical numbered timeline. A gold connector line threads through each
 * numbered node, with the step content set beside it. Fully responsive.
 */
export default function ProcessTimeline({ get }: ProcessTimelineProps) {
  return (
    <ol className="relative mx-auto max-w-3xl">
      {/* Vertical connector line */}
      <span
        aria-hidden
        className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent sm:left-7"
      />

      <div className="space-y-12 sm:space-y-16">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.baseKey} className="relative flex gap-6 sm:gap-8">
            {/* Numbered node */}
            <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-[#0A1B2A] font-serif text-lg font-bold text-primary shadow-sm sm:size-14 sm:text-xl">
              {index + 1}
            </div>

            <div className="pt-1.5 sm:pt-2.5">
              <h3 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {get(`${step.baseKey}.title`, step.title)}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {get(`${step.baseKey}.body`, step.body)}
              </p>
            </div>
          </li>
        ))}
      </div>
    </ol>
  );
}
