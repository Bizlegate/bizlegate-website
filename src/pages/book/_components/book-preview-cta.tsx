import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Section } from "@/components/layout/section.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { BOOK_PREVIEW_DEFAULTS } from "../_lib/book-data.ts";
import { openBookQuiz } from "../_lib/use-quiz-dialog.ts";

export default function BookPreviewCta() {
  const title = useContentText(
    "book.preview.title",
    BOOK_PREVIEW_DEFAULTS.title,
  );
  const body = useContentText("book.preview.body", BOOK_PREVIEW_DEFAULTS.body);
  const cta = useContentText("book.preview.cta", BOOK_PREVIEW_DEFAULTS.cta);

  return (
    <Section className="bg-background">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Sparkles className="size-6" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-card-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground">{body}</p>
        <Button
          variant="secondary"
          size="lg"
          className="cursor-pointer"
          onClick={openBookQuiz}
        >
          {cta}
        </Button>
      </div>
    </Section>
  );
}
