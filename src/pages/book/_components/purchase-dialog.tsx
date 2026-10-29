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

// The three original book tiers (see claude/00_project_status.md,
// 2026-09-27 pricing pivot) plus the Office Original merch items and
// pre-made bundles added in the 2026-10-09 /shop pivot. Every book-* tier
// grants /library access ("book-sample" unlocks two chapters,
// "book-full"/"book-deluxe" unlock all thirty); the merch items and
// bundles never do (see convex/bookAccess.ts). A bundle is bought through
// this exact same single-item dialog as everything else — see
// shop-sections.tsx for why there's no shopping cart.
export type Product =
  | "book-sample"
  | "book-full"
  | "book-deluxe"
  | "book-upgrade"
  | "book-pdf"
  | "wallpaper"
  | "print-book"
  | "tiger-figurine"
  | "tail-ring"
  | "bundle-starter"
  | "bundle-collector";

type ImageStyle = "glam" | "professional";

// Only the standalone /shop "wallpaper" item still needs the hand-made-
// wallpaper fields below. "book-deluxe" used to as well, but moved to a
// shared pre-made wallpaper library on 2026-10-26 (see wallpaperAccess in
// convex/bookAccess.ts) — it's granted automatically with no extra fields,
// same as book-full.
const NEEDS_WALLPAPER_FIELDS: ReadonlySet<Product> = new Set(["wallpaper"]);

// Only the book-* tiers care about reading language (see effectiveLang
// below) — merch items don't send a requestedLanguage at all.
const BOOK_PRODUCTS: ReadonlySet<Product> = new Set([
  "book-sample",
  "book-full",
  "book-deluxe",
  "book-upgrade",
  "book-pdf",
]);

// Physical merch items collect a shipping address — both bundles too,
// since each is expected to include at least one physical item.
const NEEDS_SHIPPING: ReadonlySet<Product> = new Set([
  "print-book",
  "tiger-figurine",
  "tail-ring",
  "bundle-starter",
  "bundle-collector",
]);

// Added 2026-10-29 — this dialog is shared across the whole site (book
// page, /library upsells, /shop), so it has to render in whichever
// language the visitor is currently reading rather than always English.
// `productLabel` itself is supplied by each caller: every caller except
// the two /library upsell buttons already resolves it through the CMS
// (useContentText/useContentGetter, which is language-aware on its own),
// so only this component's own chrome — titles, field labels, errors,
// buttons — needs its own STRINGS here.
const STRINGS = {
  en: {
    emailRequired: "Please enter your email address.",
    nameRequired: "Please enter the name on the account you'll pay from.",
    goalDateRequired: "Please share your goal-achievement date.",
    noteRequired: "Please tell us what you're working through right now.",
    shippingRequired: "Please enter a shipping address.",
    genericError: "Something went wrong — please try again.",
    submittedTitle: "One step left — send the payment",
    submittedDescription: (label: string) =>
      `Pay ${label} using the link below (works with a Wise account or a regular bank transfer). Once we see it land, we'll confirm by email — usually within one business day.`,
    referenceCodeLabel: "Your reference code",
    referenceCodeHelp:
      "Please add this as a note/message on your payment — it's how we match your transfer to your order.",
    payNow: "Pay now",
    emailInstructionsFallback: "We'll email you payment instructions shortly.",
    getTitle: (label: string) => `Get ${label}`,
    formDescription:
      "We handle payment by bank transfer, confirmed by hand — enter your email and we'll show you how to pay on the next step.",
    emailLabel: "Email",
    nameLabel: "Name on the account you'll pay from",
    nameHelp:
      "This is how we match your payment to your order — please use the same name that will show up on the transfer.",
    shippingLabel: "Shipping address",
    shippingPlaceholder: "Name, street address, city, postal code, country",
    noteLabelDefault: "Note (optional)",
    notePlaceholderDefault: "Anything we should know",
    pleaseWait: "Please wait…",
    continueToPayment: "Continue to payment",
  },
  zh: {
    emailRequired: "請輸入您的電子郵件地址。",
    nameRequired: "請輸入付款帳戶上的姓名。",
    goalDateRequired: "請填寫您的目標達成日期。",
    noteRequired: "請告訴我們您目前正在面對的狀況。",
    shippingRequired: "請輸入收件地址。",
    genericError: "發生錯誤，請再試一次。",
    submittedTitle: "最後一步——完成付款",
    submittedDescription: (label: string) =>
      `請用下方連結支付「${label}」（可用 Wise 帳戶或一般銀行轉帳）。我們確認款項入帳後，會透過 email 通知您——通常在一個工作日內。`,
    referenceCodeLabel: "您的參考碼",
    referenceCodeHelp:
      "請在付款時將這組參考碼加入備註/訊息——這是我們核對您的轉帳與訂單的依據。",
    payNow: "立即付款",
    emailInstructionsFallback: "我們會盡快寄 email 通知您付款方式。",
    getTitle: (label: string) => `取得「${label}」`,
    formDescription:
      "我們採用人工核對的銀行轉帳付款方式——請輸入您的 email，下一步會顯示付款方式。",
    emailLabel: "電子郵件",
    nameLabel: "付款帳戶上的姓名",
    nameHelp:
      "這是我們核對您的付款與訂單的依據——請填寫轉帳時會顯示的同一個姓名。",
    shippingLabel: "收件地址",
    shippingPlaceholder: "姓名、街道地址、城市、郵遞區號、國家",
    noteLabelDefault: "備註（選填）",
    notePlaceholderDefault: "有什麼我們需要知道的嗎",
    pleaseWait: "請稍候…",
    continueToPayment: "繼續前往付款",
  },
} as const;

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
  const [shippingAddress, setShippingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [wiseLink, setWiseLink] = useState<string | null>(null);
  // Shown to the buyer on the "one step left" screen and asked to be
  // included as a note on the Wise payment — this, plus the required name
  // above, is what lets the admin match an actual Wise/bank deposit back to
  // this notice (added 2026-10-26, see submitPurchaseNotice in
  // convex/bookAccess.ts and claude/16_payment_processor_decision.md).
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const needsWallpaperFields = NEEDS_WALLPAPER_FIELDS.has(product);
  const isBook = BOOK_PRODUCTS.has(product);
  const needsShipping = NEEDS_SHIPPING.has(product);

  // The book edition a buyer gets is decided by which language version of
  // the site they're actually reading right now, not by asking them to
  // pick — a "Both English + 中文" option only makes sense to someone
  // fluent in both, and we aren't selling a bundled bilingual edition. An
  // admin can still grant "both" (or switch someone's language) by hand
  // from /admin -> Book Access for a one-off case. Only read/sent for the
  // book-* tiers — merch items don't care about reading language.
  const effectiveLang = useEffectiveLang();
  const t = STRINGS[effectiveLang];
  const deluxeFormDefaults = BOOK_DELUXE_FORM_DEFAULTS[effectiveLang];

  const submitNotice = useMutation(api.bookAccess.submitPurchaseNotice);

  const reset = () => {
    setEmail("");
    setName("");
    setNote("");
    setGoalDate("");
    setImageStyle("professional");
    setShippingAddress("");
    setSubmitting(false);
    setWiseLink(null);
    setReferenceCode(null);
    setSubmitted(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t.emailRequired);
      return;
    }
    if (!name.trim()) {
      toast.error(t.nameRequired);
      return;
    }
    if (needsWallpaperFields && !goalDate.trim()) {
      toast.error(t.goalDateRequired);
      return;
    }
    if (needsWallpaperFields && !note.trim()) {
      toast.error(t.noteRequired);
      return;
    }
    if (needsShipping && !shippingAddress.trim()) {
      toast.error(t.shippingRequired);
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitNotice({
        email: email.trim(),
        name: name.trim(),
        note: note.trim() || undefined,
        product,
        requestedLanguage: isBook ? effectiveLang : undefined,
        goalDate: needsWallpaperFields ? goalDate.trim() : undefined,
        imageStyle: needsWallpaperFields ? imageStyle : undefined,
        shippingAddress: needsShipping ? shippingAddress.trim() : undefined,
      });
      setWiseLink(result.wiseLink ?? null);
      setReferenceCode(result.referenceCode ?? null);
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : t.genericError;
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
                {t.submittedTitle}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.submittedDescription(productLabel)}
              </DialogDescription>
            </DialogHeader>
            {referenceCode && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.referenceCodeLabel}
                </p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-foreground">
                  {referenceCode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.referenceCodeHelp}
                </p>
              </div>
            )}
            {wiseLink ? (
              <Button asChild size="lg" className="w-full cursor-pointer">
                <a href={wiseLink} target="_blank" rel="noopener noreferrer">
                  {t.payNow}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                {t.emailInstructionsFallback}
              </p>
            )}
            <DialogFooter showCloseButton />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t.getTitle(productLabel)}</DialogTitle>
              <DialogDescription>{t.formDescription}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchase-email">{t.emailLabel}</Label>
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
                <Label htmlFor="purchase-name">{t.nameLabel}</Label>
                <Input
                  id="purchase-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t.nameHelp}</p>
              </div>
              {needsWallpaperFields && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="purchase-goal-date">
                      {deluxeFormDefaults.goalDateLabel}
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
                    <Label>{deluxeFormDefaults.imageStyleLabel}</Label>
                    <Select
                      value={imageStyle}
                      onValueChange={(v) => setImageStyle(v as ImageStyle)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          {deluxeFormDefaults.imageStyleProfessional}
                        </SelectItem>
                        <SelectItem value="glam">
                          {deluxeFormDefaults.imageStyleGlam}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {needsShipping && (
                <div className="space-y-1.5">
                  <Label htmlFor="purchase-shipping">{t.shippingLabel}</Label>
                  <Textarea
                    id="purchase-shipping"
                    rows={3}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={t.shippingPlaceholder}
                    className="resize-none"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="purchase-note">
                  {needsWallpaperFields
                    ? deluxeFormDefaults.noteLabel
                    : t.noteLabelDefault}
                </Label>
                <Textarea
                  id="purchase-note"
                  rows={needsWallpaperFields ? 3 : 2}
                  required={needsWallpaperFields}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    needsWallpaperFields
                      ? deluxeFormDefaults.notePlaceholder
                      : t.notePlaceholderDefault
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
                    {t.pleaseWait}
                  </>
                ) : (
                  t.continueToPayment
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
