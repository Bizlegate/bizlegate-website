import { cn } from "@/lib/utils.ts";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Container inner max width + padding wrapper. Set false for full-bleed. */
  contained?: boolean;
  id?: string;
};

/**
 * Standard vertical page section with consistent spacing and a centered
 * max-width container. Keeps pages tight and scannable.
 */
export function Section({
  children,
  className,
  contained = true,
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn("px-4 py-16 sm:px-6 sm:py-20", className)}>
      {contained ? (
        <div className="mx-auto max-w-6xl">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  invert?: boolean;
  /** Overrides the eyebrow's default text-primary gold. Needed on section
   * backgrounds where gold doesn't have enough contrast to read — e.g. a
   * translucent bg-secondary/40 backdrop, which lands as a mid gray that
   * gold measures under 1.1:1 against (see book-consulting.tsx). */
  eyebrowClassName?: string;
};

/**
 * Consistent section heading: gold eyebrow, serif title, muted description.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  invert = false,
  eyebrowClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.3em]",
            eyebrowClassName ?? "text-primary",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-3xl font-bold tracking-tight sm:text-4xl",
          invert ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            invert ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
