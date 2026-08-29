import { Check } from "lucide-react";
import { EditableImage } from "@/components/media/editable-media.tsx";
import { type MediaValue } from "@/hooks/use-content.ts";
import { type GalleryImage } from "../_lib/services-data.ts";
import { cn } from "@/lib/utils.ts";

export type ServiceBlockProps = {
  /** Base CMS key, e.g. "services.facilitation" */
  baseKey: string;
  index: number;
  eyebrow: string;
  title: string;
  description: string;
  bullets: { key: string; text: string }[];
  image: MediaValue;
  imageAlt: string;
  /** Optional 2x2 gallery. When present, replaces the single image. */
  gallery?: GalleryImage[];
  /** Resolver for editable text */
  get: (key: string, fallback: string) => string;
};

/**
 * A single service category: media on one side, copy + bullet list on the
 * other. Alternates media side based on index for visual rhythm. The media is
 * either one large image or a 2x2 gallery of four images.
 *
 * Gallery blocks use two layouts: the desktop layout is unchanged, while the
 * mobile layout stacks the pieces in a dedicated order (title, photos,
 * bullets, then the paragraph).
 */
export default function ServiceBlock({
  baseKey,
  index,
  eyebrow,
  title,
  description,
  bullets,
  image,
  imageAlt,
  gallery,
  get,
}: ServiceBlockProps) {
  const reversed = index % 2 === 1;

  const eyebrowEl = (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
      {get(`${baseKey}.eyebrow`, eyebrow)}
    </p>
  );
  const titleEl = (
    <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
      {get(`${baseKey}.title`, title)}
    </h2>
  );
  const descriptionEl = (
    <p className="text-base leading-relaxed text-muted-foreground">
      {get(`${baseKey}.description`, description)}
    </p>
  );
  const bulletsEl = (
    <ul className="space-y-3">
      {bullets.map((b) => (
        <li key={b.key} className="flex gap-3">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-3.5" />
          </span>
          <span className="text-sm leading-relaxed text-foreground/90">
            {get(`${baseKey}.${b.key}`, b.text)}
          </span>
        </li>
      ))}
    </ul>
  );

  // Gallery blocks: desktop layout unchanged, mobile reordered.
  if (gallery) {
    const galleryGrid = (className?: string) => (
      <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)}>
        {gallery.map((img) => (
          <EditableImage
            key={img.key}
            contentKey={`${baseKey}.${img.key}`}
            fallback={{ url: img.url, type: "image" }}
            alt={img.alt}
            className="aspect-square rounded-xl border border-border shadow-sm"
          />
        ))}
      </div>
    );

    return (
      <>
        {/* Desktop layout — unchanged */}
        <div className="hidden items-center gap-10 lg:grid lg:grid-cols-2 lg:gap-16">
          {galleryGrid(reversed ? "lg:order-last" : undefined)}
          <div>
            {eyebrowEl}
            <div className="mt-3">{titleEl}</div>
            <div className="mt-4">{descriptionEl}</div>
            <div className="mt-6">{bulletsEl}</div>
          </div>
        </div>

        {/* Mobile layout — title, photos, bullets, then paragraph */}
        <div className="flex flex-col gap-6 lg:hidden">
          <div className="space-y-3">
            {eyebrowEl}
            {titleEl}
          </div>
          {galleryGrid()}
          {bulletsEl}
          {descriptionEl}
        </div>
      </>
    );
  }

  // Single-image block — unchanged layout.
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <EditableImage
        contentKey={`${baseKey}.image`}
        fallback={image}
        alt={imageAlt}
        className={cn(
          "aspect-[4/3] rounded-2xl border border-border shadow-sm",
          reversed && "lg:order-last",
        )}
      />
      <div>
        {eyebrowEl}
        <div className="mt-3">{titleEl}</div>
        <div className="mt-4">{descriptionEl}</div>
        <div className="mt-6">{bulletsEl}</div>
      </div>
    </div>
  );
}
