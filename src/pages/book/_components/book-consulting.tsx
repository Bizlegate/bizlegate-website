/**
 * RETIRED — the book stopped selling separate "consulting" tiers as of the
 * 2026-09-27 pricing pivot (see claude/00_project_status.md). This
 * component is no longer imported anywhere (book/page.tsx now renders
 * book-tiers.tsx instead), and its old body referenced Product values
 * ("consulting-two" / "-five" / "-ten") that no longer exist on the
 * Product type in purchase-dialog.tsx — that mismatch is what broke the
 * production build. Left as an empty stub (rather than deleted) because
 * the tools available in this workflow can't delete files on the user's
 * machine; safe to delete by hand later.
 */
export default function BookConsulting() {
  return null;
}
