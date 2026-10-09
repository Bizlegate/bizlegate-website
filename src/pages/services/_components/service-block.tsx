import { Check } from "lucide-react";
import { EditableImage } from "@/components/media/editable-media.tsx";
import { type MediaValue, useEffectiveLang } from "@/hooks/use-content.ts";
import { type GalleryImage } from "../_lib/services-data.ts";
import { cn } from "@/lib/utils.ts";

export type ServiceBlockProps = {
  /** Base CMS key, e.g. "services.facilitation" */
  baseKey: string;
  index: number;
  eyebrow: string;
  title: string;
  description: string;
  bullets: {
    key: string;
    text: string;
    hideInZh?: boolean;
    hideInEn?: boolean;
  }[];
  image: MediaValue;
  imageAlt: string;
  /** Optional 2x2 gallery. When present, replaces the single image. */
  gallery?: GalleryImage[];
  /**
   * Chinese-only replacement gallery (e.g. a service dropped a bullet/photo
   * pair that's English-only, or added one that's zh-only — see
   * services-data.ts). When set and the site is in zh, this replaces
   * `gallery` entirely rather than filtering it, since the photo count
   * itself can differ between languages.
   */
  galleryZh?: GalleryImage[];
  /** Resolver for editable text */
  get: (key: string, fallback: string) => string;
};

/**
 * A single service category: media on one side, copy + bullet list on the
 * other. Alternates media side based on index for visual rhythm. The media is
 * either one large image or a gallery of photos.
 *
 * Gallery blocks use two layouts: the desktop layout is unchanged, while the
 * mobile layout stacks the pieces in a dedicated order (title, photos,
 * bullets, then the paragraph). A 4-photo gallery renders as an even 2x2
 * grid; a 3-photo gallery renders as a bento (one tall hero photo beside two
 * stacked photos) so there's no empty fourth cell.
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
  galleryZh,
  get,
}: ServiceBlockProps) {
  const reversed = index % 2 === 1;
  const lang = useEffectiveLang();
  const visibleBullets = bullets.filter((b) =>
    lang === "zh" ? !b.hideInZh : !b.hideInEn,
  );
  const effectiveGallery = lang === "zh" && galleryZh ? galleryZh : gallery;

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
      {visibleBullets.map((b) => (
        <li key={b.key} className="flex gap-3">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
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
  if (effectiveGallery) {
    const photo = (img: GalleryImage, extraClassName?: string) => (
      <EditableImage
        key={img.key}
        contentKey={`${baseKey}.${img.key}`}
        fallback={{ url: img.url, type: "image" }}
        alt={img.alt}
        className={cn("rounded-xl border border-border shadow-sm", extraClassName)}
      />
    );

    // 3 photos: bento layout (one tall hero + two stacked) so there's no
    // empty fourth cell. 4 photos (or any other count): even square grid.
    const galleryGrid = (className?: string) =>
      effectiveGallery.length === 3 ? (
        <div className={cn("grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4", className)}>
          {photo(effectiveGallery[0], "row-span-2")}
          {photo(effectiveGallery[1], "aspect-square")}
          {photo(effectiveGallery[2], "aspect-square")}
        </div>
      ) : (
        <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)}>
          {effectiveGallery.map((img) => photo(img, "aspect-square"))}
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
