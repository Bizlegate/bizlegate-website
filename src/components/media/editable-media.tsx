import { useMediaValue, type MediaValue } from "@/hooks/use-content.ts";
import { cn } from "@/lib/utils.ts";

/** Convert a YouTube watch/share/embed URL into an embeddable URL. */
export function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.pathname.includes("/embed/")) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

type EditableImageProps = {
  contentKey: string;
  fallback: MediaValue;
  alt: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Renders a CMS-editable image. Admin can swap the URL from the backend.
 */
export function EditableImage({
  contentKey,
  fallback,
  alt,
  className,
  imgClassName,
}: EditableImageProps) {
  const media = useMediaValue(contentKey, fallback);
  return (
    <div className={cn("overflow-hidden", className)}>
      <img
        src={media.url}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

type EditableMediaFrameProps = {
  contentKey: string;
  fallback: MediaValue;
  title: string;
  className?: string;
};

/**
 * Renders a 16:9 media frame. If the CMS media is a YouTube link, it embeds
 * the player. Otherwise it shows the poster image with a "video coming soon"
 * treatment (used for case-study placeholders until real footage is added).
 */
export function EditableMediaFrame({
  contentKey,
  fallback,
  title,
  className,
}: EditableMediaFrameProps) {
  const media = useMediaValue(contentKey, fallback);
  const embed = media.type === "youtube" ? toYouTubeEmbed(media.url) : null;

  if (embed) {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl border border-border bg-black",
          className,
        )}
      >
        <iframe
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl border border-border bg-black",
          className,
        )}
      >
        <video
          src={media.url}
          controls
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  // Image poster placeholder
  return (
    <div
      className={cn(
        "group relative aspect-video overflow-hidden rounded-xl border border-border",
        className,
      )}
    >
      <img
        src={media.url}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2A]/90 via-[#0A1B2A]/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
          <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs uppercase tracking-widest text-primary/90">
          Case study · Footage coming soon
        </p>
      </div>
    </div>
  );
}
