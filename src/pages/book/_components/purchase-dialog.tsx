import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useEffectiveLang } from "@/hooks/use-content.ts";
import { BOOK_DELUXE_FORM_DEFAULTS } from "../_lib/book-data.ts";

// The three book tiers — see claude/00_project_status.md (2026-09-27
// pricing pivot). All three grant /library access; "book-sample" unlocks
// two chapters, "book-full" and "book-deluxe" unlock all thirty.
export type Product = "book-sample" | "book-full" | "book-deluxe";

type ImageStyle = "glam" | "professional";

/**
 * "Buy" flow for the manual bank-transfer model (see
 * claude/16_payment_processor_decision.md) — replaces a real checkout.
 * Wraps whatever trigger element the caller passes in (the existing buy
 * button, styled however that page already styles it). On submit, the
 * Wise payment link comes back in the mutation's response — it is never
 * fetched by any public page load, only returned here, after the buyer has
 * already told us they intend to pay (see the comment on
 * submitPurchaseNotice in convex/bookAccess.ts for why that matters).
 */
export default function PurchaseDialog({
  product,
  productLabel,
  children,
}: {
  product: Product;
  productLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("professional");
  const [submitting, setSubmitting] = useState(false);
  const [wiseLink, setWiseLink] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isDeluxe = product === "book-deluxe";

  // The book edition a buyer gets is decided by which language version of
  // the site they're actually reading right now, not by asking them to
  // pick — a "Both English + 中文" option only makes sense to someone
  // fluent in both, and we aren't selling a bundled bilingual edition. An
  // admin can still grant "both" (or switch someone's language) by hand
  // from /admin -> Book Access for a one-off case.
  const effectiveLang = useEffectiveLang();

  const submitNotice = useMutation(api.bookAccess.submitPurchaseNotice);

  const reset = () => {
    setEmail("");
    setName("");
    setNote("");
    setGoalDate("");
    setImageStyle("professional");
    setSubmitting(false);
    setWiseLink(null);
    setSubmitted(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (isDeluxe && !goalDate.trim()) {
      toast.error("Please share your goal-achievement date.");
      return;
    }
    if (isDeluxe && !note.trim()) {
      toast.error("Please tell us what you're working through right now.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitNotice({
        email: email.trim(),
        name: name.trim() || undefined,
        note: note.trim() || undefined,
        product,
        requestedLanguage: effectiveLang,
        goalDate: isDeluxe ? goalDate.trim() : undefined,
        imageStyle: isDeluxe ? imageStyle : undefined,
      });
      setWiseLink(result.wiseLink ?? null);
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong — please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {submitted ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <DialogTitle className="text-center">
                One step left — send the payment
              </DialogTitle>
              <DialogDescription className="text-center">
                Pay {productLabel} using the link below (works with a Wise
                account or a regular bank transfer). Once we see it land,
                we'll confirm by email — usually within one business day.
              </DialogDescription>
            </DialogHeader>
            {wiseLink ? (
              <Button asChild size="lg" className="w-full cursor-pointer">
                <a href={wiseLink} target="_blank" rel="noopener noreferrer">
                  Pay now
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                We'll email you payment instructions shortly.
              </p>
            )}
            <DialogFooter showCloseButton />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get {productLabel}</DialogTitle>
              <DialogDescription>
                We handle payment by bank transfer, confirmed by hand — enter
                your email and we'll show you how to pay on the next step.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchase-email">Email</Label>
                <Input
                  id="purchase-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purchase-name">Name (optional)</Label>
                <Input
                  id="purchase-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {isDeluxe && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="purchase-goal-date">
                      {BOOK_DELUXE_FORM_DEFAULTS.goalDateLabel}
                    </Label>
                    <Input
                      id="purchase-goal-date"
                      type="date"
                      required
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{BOOK_DELUXE_FORM_DEFAULTS.imageStyleLabel}</Label>
                    <Select
                      value={imageStyle}
                      onValueChange={(v) => setImageStyle(v as ImageStyle)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          {BOOK_DELUXE_FORM_DEFAULTS.imageStyleProfessional}
                        </SelectItem>
                        <SelectItem value="glam">
                          {BOOK_DELUXE_FORM_DEFAULTS.imageStyleGlam}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="purchase-note">
                  {isDeluxe
                    ? BOOK_DELUXE_FORM_DEFAULTS.noteLabel
                    : "Note (optional)"}
                </Label>
                <Textarea
                  id="purchase-note"
                  rows={isDeluxe ? 3 : 2}
                  required={isDeluxe}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isDeluxe
                      ? BOOK_DELUXE_FORM_DEFAULTS.notePlaceholder
                      : "Anything we should know"
                  }
                  className="resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Please wait…
                  </>
                ) : (
                  "Continue to payment"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
