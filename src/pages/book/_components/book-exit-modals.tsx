import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import {
  BOOK_EXIT_PREVIEW_DEFAULTS,
  BOOK_AUTHOR_NOTE_PARAGRAPHS,
} from "../_lib/book-data.ts";
import { markBuyClicked, useExitIntent } from "../_lib/use-exit-intent.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag } from "./price-tag.tsx";

/**
 * The idle-30s "don't lose the visitor" popup for the /book page — see
 * use-exit-intent.ts for exactly what triggers it and why. This is the
 * Author's Note in full, the ONLY free content on the page by deliberate
 * decision (no free chapter). The other exit-intent trigger (a genuine
 * leave attempt) opens the quiz dialog instead — see book-quiz-dialog.tsx,
 * a separate, single shared dialog instance mounted once on the page.
 */
export default function BookExitModals() {
  const { showPreview, dismissPreview } = useExitIntent();
  const { regularPrice, salePrice, onSale } = useBookPrice();
  const get = useContentGetter();

  const previewTitle = useContentText(
    "book.exit.preview.title",
    BOOK_EXIT_PREVIEW_DEFAULTS.title,
  );
  const previewBody = useContentText(
    "book.exit.preview.body",
    BOOK_EXIT_PREVIEW_DEFAULTS.body,
  );
  const previewCta = useContentText(
    "book.exit.preview.cta",
    BOOK_EXIT_PREVIEW_DEFAULTS.cta,
  );

  function handleBuyFromModal() {
    markBuyClicked();
    dismissPreview();
    toast.info("Checkout is coming soon — thanks for your patience.");
  }

  return (
    <Dialog open={showPreview} onOpenChange={dismissPreview}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {previewTitle}
          </DialogTitle>
          <DialogDescription>{previewBody}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Author's Note
          </p>
          {BOOK_AUTHOR_NOTE_PARAGRAPHS.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {get(`book.exit.authorNote.${i}`, paragraph)}
            </p>
          ))}
        </div>
        <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PriceTag
            regularPrice={regularPrice}
            salePrice={salePrice}
            onSale={onSale}
            size="md"
          />
          <Button
            className="w-full cursor-pointer sm:w-auto"
            onClick={handleBuyFromModal}
          >
            {previewCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
