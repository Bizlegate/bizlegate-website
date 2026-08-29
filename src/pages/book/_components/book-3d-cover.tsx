/**
 * Renders a flat cover image as a tilted, extruded 3D book using CSS
 * transforms only (no separate mockup asset needed — swap the cover image
 * in /admin and this still works).
 *
 * The "pages" strip is anchored with `transformOrigin: "left center"` and
 * rotated in place, so its hinge edge stays mathematically glued to the
 * cover's left edge (full height, no top/bottom gap or manual pixel
 * offsets to fudge) instead of being a separately-positioned sliver that
 * has to be eyeballed into alignment — that mismatch is what read as a
 * pasted-on seam before. The tilt itself is kept modest (12deg) since a
 * steeper rotateY foreshortens the cover's width without touching its
 * height, which is what made the book look stretched/too tall.
 */
export default function Book3dCover({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ perspective: "2400px" }}>
      <div
        className="relative mx-auto w-56 sm:w-64 md:w-72"
        style={{ transformStyle: "preserve-3d", transform: "rotateY(-12deg)" }}
      >
        {/* pages, hinged to the cover's left edge — sits behind the cover */}
        <div
          className="absolute inset-y-0 left-0 w-3"
          style={{
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
            background:
              "repeating-linear-gradient(to bottom, #f3eee1 0px, #f3eee1 2px, #e3dcc8 2px, #e3dcc8 3px)",
            boxShadow: "inset 3px 0 6px rgba(0,0,0,0.25)",
          }}
        />
        <img
          src={src}
          alt={alt}
          className="relative block w-full"
          style={{
            borderRadius: "2px 6px 6px 2px",
            boxShadow:
              "2px 4px 0 rgba(0,0,0,0.05), 16px 22px 38px -14px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.08)",
          }}
        />
        {/* spine shading over the cover's own left edge */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-3.5 rounded-l-sm"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0) 85%)",
          }}
        />
      </div>
    </div>
  );
}
