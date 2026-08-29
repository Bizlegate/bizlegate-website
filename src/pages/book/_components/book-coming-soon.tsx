import { BookOpen } from "lucide-react";

/**
 * Shown at /book while site.bookEnabled is off (the default until the admin
 * turns it on from /admin → Content → Book). Deliberately gives away
 * nothing about the page underneath.
 */
export default function BookComingSoon() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <BookOpen className="size-7" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
        This page isn't live yet.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Check back soon.
      </p>
    </div>
  );
}
