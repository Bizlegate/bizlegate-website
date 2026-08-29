import { useContext, useEffect } from "react";
import { ContentContext } from "@/hooks/use-content.ts";
import BookHero from "./_components/book-hero.tsx";
import BookConsulting from "./_components/book-consulting.tsx";
import BookConsultingSale from "./_components/book-consulting-sale.tsx";
import BookValueStack from "./_components/book-value-stack.tsx";
import BookStructure from "./_components/book-structure.tsx";
import BookPreviewCta from "./_components/book-preview-cta.tsx";
import BookFinalCta from "./_components/book-final-cta.tsx";
import BookComingSoon from "./_components/book-coming-soon.tsx";
import BookExitModals from "./_components/book-exit-modals.tsx";
import BookQuizDialog from "./_components/book-quiz-dialog.tsx";

/**
 * The book sales/landing page (Be the Outsmarter). Gated behind the
 * site.bookEnabled admin flag (default OFF) so it can be built, edited from
 * /admin, and previewed via direct URL before it's ready for ad/YouTube
 * traffic — see ZhSiteToggle for the same pattern applied to the Chinese
 * site. English-only / US-market only by design (see the revenue plan);
 * this page does not use the zh bilingual hooks.
 */
export default function Book() {
  const { content } = useContext(ContentContext);
  const enabled = content?.["site.bookEnabled"] === "true";

  // Lock this route to the light theme regardless of the visitor's OS
  // dark-mode preference — see the `.book-page` rule in index.css for why
  // (in dark mode, --background and --secondary collapse into the same
  // navy, and every section on the page loses its contrast). Toggled on
  // <html> rather than a wrapper div so it also reaches dialogs, which
  // Radix portals to document.body outside this component's own DOM tree.
  useEffect(() => {
    document.documentElement.classList.add("book-page");
    return () => {
      document.documentElement.classList.remove("book-page");
    };
  }, []);

  if (!enabled) {
    return <BookComingSoon />;
  }

  return (
    <>
      <BookHero />
      <BookValueStack />
      <BookStructure />
      <BookConsulting />
      <BookPreviewCta />
      <BookFinalCta />
      <BookConsultingSale />
      <BookExitModals />
      <BookQuizDialog />
    </>
  );
}
