import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import {
  BadgeCheck,
  Ban,
  BookOpen,
  Check,
  Copy,
  FileDown,
  ImageIcon,
  Inbox,
  KeyRound,
  Link2,
  Pencil,
  RotateCcw,
  Sparkles,
  SpellCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";

type Language = "en" | "zh" | "both";
type ChapterAccess = "sample" | "full";
type Product =
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

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  zh: "中文",
  both: "English + 中文",
};

const PRODUCT_LABEL: Record<Product, string> = {
  "book-sample": "Tier 1 — Two Chapters ($10)",
  "book-full": "Tier 2 — Booklet ($42.39)",
  "book-deluxe": "Tier 3 — Booklet + Wallpaper Library ($83.59)",
  // Added 2026-10-26 — the "Get the full book" button a Tier 1 reader sees
  // in /library; they pay only the $32.39 difference, and grantAccess
  // upgrades their existing row (same email) to chapterAccess "full"
  // instead of creating a new one.
  "book-upgrade": "Tier 1 → Booklet Upgrade ($32.39)",
  // Added 2026-10-27 — paid add-on for a buyer who already has Tier 2/3
  // (chapterAccess "full"): a downloadable PDF keepsake copy, on top of the
  // online reader. See PDF_ACCESS_FOR_PRODUCT below and the PdfDownloadManager
  // uploader further down this file.
  "book-pdf": "Add-on — PDF Keepsake Download ($14.99)",
  wallpaper: "/shop — Custom Desktop Wallpaper",
  "print-book": "/shop — Printed Copy",
  "tiger-figurine": "/shop — 虎爺擺飾 (Tiger Figurine)",
  "tail-ring": "/shop — 尾戒 (Tail Ring)",
  "bundle-starter": "/shop — Starter Bundle",
  "bundle-collector": "/shop — Collector Bundle",
};

// The three tiers that grant /library access — used to auto-pick the right
// chapterAccess when granting from a pending notice, so the admin never has
// to remember which product means which. A product with no entry here (any
// /shop merch item) never grants library access — the panel shows "Mark
// fulfilled" instead of "Grant access" for those (see PendingNotices).
const CHAPTER_ACCESS_FOR_PRODUCT: Partial<Record<Product, ChapterAccess>> = {
  "book-sample": "sample",
  "book-full": "full",
  "book-deluxe": "full",
  "book-upgrade": "full",
};

// Only Tier 3 also unlocks the /library "Wallpapers" tab — a shared pool of
// pre-made wallpapers uploaded once below (see WallpaperLibraryManager),
// not a one-off hand-made image per buyer (that was the model before the
// 2026-10-26 pivot — the standalone /shop "wallpaper" item still works the
// old way, by the client's choice).
const WALLPAPER_ACCESS_FOR_PRODUCT: Partial<Record<Product, boolean>> = {
  "book-deluxe": true,
};

// Only the book-pdf add-on grants the paid PDF download — deliberately a
// separate map from CHAPTER_ACCESS_FOR_PRODUCT (not merged into it) because
// granting this must never touch chapterAccess: a book-pdf notice is always
// an add-on for someone who already has Tier 2/3 access, not a fresh grant,
// so handleGrant below omits chapterAccess for it and grantAccess preserves
// whatever the buyer's existing row already has.
const PDF_ACCESS_FOR_PRODUCT: Partial<Record<Product, boolean>> = {
  "book-pdf": true,
};

function isBookProduct(product: Product): boolean {
  return (
    product in CHAPTER_ACCESS_FOR_PRODUCT || product in PDF_ACCESS_FOR_PRODUCT
  );
}

const IMAGE_STYLE_LABEL: Record<string, string> = {
  glam: "With character artwork",
  professional: "Professional only",
};

function copyToClipboard(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied.`))
    .catch(() => toast.error("Could not copy — copy it by hand instead."));
}

/**
 * Admin panel for the manual bank-transfer + online-reading flow (see
 * claude/16_payment_processor_decision.md). Two halves: the queue of
 * buyers who said "I paid", and the actual /library access grants — this
 * is where the admin does the one manual step the whole system relies on
 * (checking the bank/Wise account against a buyer's email before granting).
 */
export default function BookAccessPanel() {
  return (
    <div className="space-y-10">
      <PendingNotices />
      <ManualGrantForm />
      <ExistingGrants />
      <PaymentLinksEditor />
      <SampleChapterEditor />
      <BookPagesManager />
      <PdfDownloadManager />
      <WallpaperLibraryManager />
    </div>
  );
}

function PendingNotices() {
  const notices = useQuery(api.bookAccess.listPurchaseNotices, {
    status: "pending",
  });
  const grant = useMutation(api.bookAccess.grantAccess);
  const fulfill = useMutation(api.bookAccess.markNoticeFulfilled);
  const dismiss = useMutation(api.bookAccess.dismissPurchaseNotice);
  const [languageByNotice, setLanguageByNotice] = useState<
    Record<string, Language>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleGrant = async (noticeId: string, email: string, product: Product) => {
    const language = languageByNotice[noticeId] ?? "en";
    setBusyId(noticeId);
    try {
      await grant({
        email,
        language,
        chapterAccess: CHAPTER_ACCESS_FOR_PRODUCT[product],
        wallpaperAccess: WALLPAPER_ACCESS_FOR_PRODUCT[product] ?? false,
        // No `?? false` here on purpose — leaving it undefined for every
        // product except book-pdf lets grantAccess preserve whatever
        // pdfAccess the buyer's existing row already had (see its comment).
        pdfAccess: PDF_ACCESS_FOR_PRODUCT[product],
        sourceNoticeId: noticeId as Parameters<
          typeof grant
        >[0]["sourceNoticeId"],
      });
      toast.success(`Access granted and emailed to ${email}.`);
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Could not grant access.";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  // For a /shop merch item — no /library access to grant, just a hand-made
  // or hand-shipped item to mark done once it's actually been sent. Never
  // emails the buyer (there's no automated delivery to confirm).
  const handleFulfill = async (noticeId: string) => {
    setBusyId(noticeId);
    try {
      await fulfill({
        noticeId: noticeId as Parameters<typeof fulfill>[0]["noticeId"],
      });
      toast.success("Marked as fulfilled.");
    } catch {
      toast.error("Could not mark this notice fulfilled.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (noticeId: string) => {
    setBusyId(noticeId);
    try {
      await dismiss({
        noticeId: noticeId as Parameters<
          typeof dismiss
        >[0]["noticeId"],
      });
    } catch {
      toast.error("Could not dismiss this notice.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <Inbox className="size-5 text-primary" />
        Pending purchase notices
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Buyers who said they've sent the bank transfer, from /shop or the
        booklet's tiers. Check your Wise / bank statement for a matching
        deposit before acting on one — this is the one manual step the
        whole flow relies on. The three booklet tiers grant /library access
        ("Grant access" below); Tier 1 only unlocks the two sample chapters
        (see the chapter-numbers editor below), Tiers 2 and 3 unlock all
        thirty — Tier 3 also unlocks the "Wallpapers" tab there
        automatically (a shared pool you upload to once, below, not a
        per-buyer custom job). The PDF add-on ("Grant access" too) only ever
        adds the downloadable-PDF button to a buyer's existing /library
        access — pick the same language they already have, it never changes
        their chapter access. Every other /shop item ("Mark fulfilled"
        below) is hand-made or hand-shipped by you — the standalone
        wallpaper item still needs a custom desktop image made by hand from
        the goal date / style / note shown below, and a physical item needs
        to be shipped to the address shown; acting on a notice here does NOT
        send or ship anything automatically, that's a separate step you do
        yourself.
      </p>

      {notices === undefined ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <Empty className="mt-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Nothing pending</EmptyTitle>
            <EmptyDescription>
              New purchase notices from /shop will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 space-y-3">
          {notices.map((notice) => {
            const product = notice.product as Product;
            return (
              <div
                key={notice._id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">
                      {notice.name ? `${notice.name} — ${notice.email}` : notice.email}
                    </p>
                    {notice.referenceCode && (
                      <p className="mt-1 text-sm">
                        <span className="text-muted-foreground">Match against: </span>
                        <span className="font-mono font-bold tracking-wider text-primary">
                          {notice.referenceCode}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          (name + this code on the Wise deposit)
                        </span>
                      </p>
                    )}
                    {notice.goalDate && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Goal date: {notice.goalDate}
                        {notice.imageStyle
                          ? ` · ${IMAGE_STYLE_LABEL[notice.imageStyle] ?? notice.imageStyle}`
                          : ""}
                      </p>
                    )}
                    {notice.shippingAddress && (
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                        Ship to: {notice.shippingAddress}
                      </p>
                    )}
                    {notice.note && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        "{notice.note}"
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1.5 align-middle">
                        {PRODUCT_LABEL[product]}
                      </Badge>
                      {notice.requestedLanguage &&
                        `Requested ${LANGUAGE_LABEL[notice.requestedLanguage]} · `}
                      {format(new Date(notice._creationTime), "PPp")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBookProduct(product) ? (
                      <>
                        <Select
                          value={
                            languageByNotice[notice._id] ??
                            notice.requestedLanguage ??
                            "en"
                          }
                          onValueChange={(v) =>
                            setLanguageByNotice((prev) => ({
                              ...prev,
                              [notice._id]: v as Language,
                            }))
                          }
                        >
                          <SelectTrigger className="w-36 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="both">English + 中文</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="cursor-pointer"
                          disabled={busyId === notice._id}
                          onClick={() => handleGrant(notice._id, notice.email, product)}
                        >
                          <BadgeCheck className="size-4" />
                          Grant access
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        disabled={busyId === notice._id}
                        onClick={() => handleFulfill(notice._id)}
                      >
                        <BadgeCheck className="size-4" />
                        Mark fulfilled
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer text-muted-foreground"
                      disabled={busyId === notice._id}
                      onClick={() => handleDismiss(notice._id)}
                      aria-label="Dismiss"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManualGrantForm() {
  const grant = useMutation(api.bookAccess.grantAccess);
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [chapterAccess, setChapterAccess] = useState<ChapterAccess>("full");
  const [wallpaperAccess, setWallpaperAccess] = useState(false);
  const [pdfAccess, setPdfAccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter an email address.");
      return;
    }
    setSubmitting(true);
    try {
      await grant({
        email: trimmed,
        language,
        chapterAccess,
        wallpaperAccess,
        pdfAccess,
      });
      toast.success(`Access granted and emailed to ${trimmed}.`);
      setEmail("");
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Could not grant access.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <KeyRound className="size-5 text-primary" />
        Grant access directly
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        For a comp copy, a payment that arrived without a purchase notice, or
        to reissue a code — skips the pending-notice queue above.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="email"
          placeholder="buyer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sm:flex-1"
        />
        <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
          <SelectTrigger className="sm:w-44 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="both">English + 中文</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={chapterAccess}
          onValueChange={(v) => setChapterAccess(v as ChapterAccess)}
        >
          <SelectTrigger className="sm:w-40 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Booklet</SelectItem>
            <SelectItem value="sample">2 sample chapters</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} disabled={submitting} className="cursor-pointer">
          Grant &amp; email code
        </Button>
      </div>
      <label className="mt-3 flex w-fit items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={wallpaperAccess}
          onCheckedChange={(v) => setWallpaperAccess(v === true)}
        />
        Also include wallpaper library access (normally only Tier 3 grants this)
      </label>
      <label className="mt-2 flex w-fit items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={pdfAccess}
          onCheckedChange={(v) => setPdfAccess(v === true)}
        />
        Also include the PDF keepsake download (normally a paid add-on)
      </label>
    </div>
  );
}

function ExistingGrants() {
  const grants = useQuery(api.bookAccess.listGrants, {});
  const revoke = useMutation(api.bookAccess.revokeAccess);
  const regrant = useMutation(api.bookAccess.grantAccess);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const handleRevoke = async (email: string) => {
    setBusyEmail(email);
    try {
      await revoke({ email });
      toast.success(`Access revoked for ${email}.`);
    } catch {
      toast.error("Could not revoke access.");
    } finally {
      setBusyEmail(null);
    }
  };

  const handleResend = async (
    email: string,
    language: Language,
    chapterAccess: ChapterAccess,
    wallpaperAccess: boolean,
    pdfAccess: boolean,
  ) => {
    setBusyEmail(email);
    try {
      // Passing wallpaperAccess/pdfAccess through explicitly (rather than
      // omitting them) so a plain "resend my code" click can never be
      // misread — the server also preserves them when omitted, but being
      // explicit here keeps this call's intent obvious.
      await regrant({ email, language, chapterAccess, wallpaperAccess, pdfAccess });
      toast.success(`New code generated and emailed to ${email}.`);
    } catch {
      toast.error("Could not resend a code.");
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <KeyRound className="size-5 text-primary" />
        /library access grants
      </h3>

      {grants === undefined ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : grants.length === 0 ? (
        <Empty className="mt-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyRound />
            </EmptyMedia>
            <EmptyTitle>No grants yet</EmptyTitle>
            <EmptyDescription>
              Buyers you grant access to will show up here, with their
              access code visible for you to resend if needed.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 space-y-2">
          {grants.map((g) => {
            const chapterAccess: ChapterAccess = g.chapterAccess ?? "full";
            return (
              <div
                key={g._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-card-foreground">
                    {g.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(g.code, "Access code")}
                    className="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    {g.code}
                    <Copy className="size-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {g.active ? (
                    <>
                      <Badge variant="secondary" className="gap-1">
                        {chapterAccess === "sample" ? (
                          <Sparkles className="size-3" />
                        ) : (
                          <BookOpen className="size-3" />
                        )}
                        {chapterAccess === "sample" ? "2 chapters" : "Booklet"}
                      </Badge>
                      {g.wallpaperAccess && (
                        <Badge variant="secondary" className="gap-1">
                          <ImageIcon className="size-3" />
                          Wallpapers
                        </Badge>
                      )}
                      {g.pdfAccess && (
                        <Badge variant="secondary" className="gap-1">
                          <FileDown className="size-3" />
                          PDF
                        </Badge>
                      )}
                      <Badge variant="secondary">{LANGUAGE_LABEL[g.language]}</Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Ban className="size-3" />
                      Revoked
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="cursor-pointer text-muted-foreground"
                    disabled={busyEmail === g.email}
                    onClick={() =>
                      handleResend(
                        g.email,
                        g.language,
                        chapterAccess,
                        g.wallpaperAccess ?? false,
                        g.pdfAccess ?? false,
                      )
                    }
                    aria-label="Resend a new code"
                    title="Resend a new code"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                  {g.active && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer text-destructive hover:text-destructive"
                      disabled={busyEmail === g.email}
                      onClick={() => handleRevoke(g.email)}
                      aria-label="Revoke access"
                      title="Revoke access"
                    >
                      <Ban className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaymentLinksEditor() {
  const links = useQuery(api.bookAccess.listPaymentLinks, {});
  const setLink = useMutation(api.bookAccess.setPaymentLink);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingProduct, setSavingProduct] = useState<Product | null>(null);

  const handleSave = async (product: Product, currentValue: string) => {
    const value = draft[product] ?? currentValue;
    setSavingProduct(product);
    try {
      await setLink({ product, wiseLink: value });
      toast.success("Payment link saved.");
    } catch {
      toast.error("Could not save this link.");
    } finally {
      setSavingProduct(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <Link2 className="size-5 text-primary" />
        Wise payment links
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Shown to a buyer only after they submit their email on /shop — never
        on any public page (see claude/16_payment_processor_decision.md).
        Paste a Wise "request money" link per product; leave blank to fall
        back to the hardcoded default in convex/bookAccess.ts. Tier 2 —
        Booklet ($42.39) already has one — every other item needs its own
        fixed-amount link created in Wise before it can show a "Pay now"
        button.
      </p>

      {links === undefined ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {links.map((link) => (
            <div key={link.product} className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {link.label}
                {link.isOverride ? "" : " (using default)"}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={draft[link.product] ?? link.wiseLink}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [link.product]: e.target.value }))
                  }
                  placeholder="https://wise.com/pay/r/..."
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={savingProduct === link.product}
                  onClick={() => handleSave(link.product, link.wiseLink)}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Which two chapter numbers the $10 Tier 1 unlocks — a plain comma-
// separated list (e.g. "5,12"), stored in the generic content table under
// SAMPLE_CHAPTERS_KEY in convex/bookAccess.ts. Kept separate from the
// ContentEditor's page-schema system since it's backend logic (which
// chapters getChapters actually returns), not display copy.
function SampleChapterEditor() {
  const setting = useQuery(api.bookAccess.getSampleChapterSetting, {});
  const setSetting = useMutation(api.bookAccess.setSampleChapterSetting);
  const [draft, setDraft] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (setting && !dirty) {
      setDraft(setting.value || setting.default);
    }
  }, [setting, dirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({ value: draft.trim() });
      toast.success("Sample chapters saved.");
      setDirty(false);
    } catch {
      toast.error("Could not save — check the format (e.g. \"5,12\").");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <Sparkles className="size-5 text-primary" />
        Tier 1 — which chapters
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Chapter numbers (1–30), comma-separated, e.g. "5,12" — this is
        exactly what every $10 Tier 1 buyer sees at /library. Placeholder
        default is chapters 1 and 2 until you set the real ones here.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setDirty(true);
          }}
          placeholder={setting?.default ?? "1,2"}
          className="sm:max-w-xs font-mono"
        />
        <Button
          size="sm"
          variant="secondary"
          className="cursor-pointer"
          disabled={saving || setting === undefined}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

// Real page-image uploader for /library's page-flip reader (approved
// 2026-10-26 — "你可以正式把中文版放到 library 了", see
// claude/16_payment_processor_decision.md and the bookPages table comment
// in schema.ts for the chapterNumber convention this relies on). Expects
// filenames like p001_cover.jpg / p002_fm.jpg / p003_ch01.jpg so `order`
// and `chapterNumber` can be parsed straight from the filename — no
// separate page manifest to keep in sync with the images themselves.
const PAGE_FILENAME_RE = /^p(\d{3})_(cover|fm|ch(\d{2}))\.(jpe?g|png)$/i;

function parsePageFilename(
  name: string,
): { order: number; chapterNumber?: number } | null {
  const m = name.match(PAGE_FILENAME_RE);
  if (!m) return null;
  const order = parseInt(m[1], 10);
  const tag = m[2].toLowerCase();
  if (tag === "cover") return { order, chapterNumber: 0 };
  if (tag === "fm") return { order };
  return { order, chapterNumber: parseInt(m[3], 10) };
}

function BookPagesManager() {
  const status = useQuery(api.bookAccess.bookPagesStatus, {});
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const savePage = useMutation(api.bookAccess.saveBookPage);
  const clearPages = useMutation(api.bookAccess.clearBookPages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    const parsed = files
      .map((file) => ({ file, parsed: parsePageFilename(file.name) }))
      .filter(
        (
          f,
        ): f is {
          file: File;
          parsed: { order: number; chapterNumber?: number };
        } => f.parsed !== null,
      )
      .sort((a, b) => a.parsed.order - b.parsed.order);

    const skipped = files.length - parsed.length;
    if (parsed.length === 0) {
      toast.error(
        'No file names matched the expected pattern (e.g. "p001_cover.jpg", "p014_ch05.jpg").',
      );
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: parsed.length });
    let failed = 0;
    for (const { file, parsed: p } of parsed) {
      try {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = await res.json();
        await savePage({
          language,
          order: p.order,
          chapterNumber: p.chapterNumber,
          storageId,
        });
      } catch {
        failed += 1;
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }
    setUploading(false);
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (failed === 0) {
      toast.success(
        `Uploaded ${parsed.length} page${parsed.length === 1 ? "" : "s"}${
          skipped
            ? ` (${skipped} file name${skipped === 1 ? "" : "s"} skipped — didn't match the pattern)`
            : ""
        }.`,
      );
    } else {
      toast.error(
        `${failed} of ${parsed.length} pages failed to upload — try selecting them again.`,
      );
    }
  };

  const handleClear = async () => {
    if (
      !window.confirm(
        `Delete all uploaded ${
          language === "zh" ? "中文" : "English"
        } pages? This can't be undone — you'd need to re-upload every page.`,
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const result = await clearPages({ language });
      toast.success(
        `Removed ${result.deleted} page${result.deleted === 1 ? "" : "s"}.`,
      );
    } catch {
      toast.error("Could not clear these pages.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <BookOpen className="size-5 text-primary" />
        Booklet pages (page-flip reader)
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload the real booklet-page screenshots that power /library's
        page-flip view — once at least one page exists for a language, the
        plain-text reader for that language switches over automatically,
        no separate "go live" step. Name each file{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          p001_cover.jpg
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          p00N_fm.jpg
        </code>{" "}
        (other front/back matter — table of contents, author's note, etc.),
        or{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          p0NN_ch05.jpg
        </code>{" "}
        (a page of chapter 5) — the 3-digit number sets reading order, the
        tag sets which chapter it belongs to and therefore who can see it
        (sample vs. full access — see schema.ts). Select every page file for
        the language at once; re-uploading a page number already on file
        replaces it in place.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as "en" | "zh")}
        >
          <SelectTrigger className="w-32 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
        <Button
          variant="secondary"
          className="cursor-pointer"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading && progress
            ? `Uploading ${progress.done}/${progress.total}…`
            : "Select page images"}
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer text-destructive hover:text-destructive"
          disabled={clearing || uploading}
          onClick={handleClear}
        >
          <Trash2 className="size-4" />
          Clear {language === "zh" ? "中文" : "English"} pages
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {status === undefined
          ? "Loading current counts…"
          : `Currently uploaded: 中文 ${status.zh} page${
              status.zh === 1 ? "" : "s"
            } · English ${status.en} page${status.en === 1 ? "" : "s"}.`}
      </p>
    </div>
  );
}

// The single downloadable PDF per language sold as the "collect a keepsake
// copy" paid add-on (book-pdf, see PDF_ACCESS_FOR_PRODUCT above) — just the
// same print-ready manuscript file used to generate the page-flip images
// above, handed over whole. Mirrors BookPagesManager's upload pattern but
// one file per language instead of one per physical page.
function PdfDownloadManager() {
  const status = useQuery(api.bookAccess.pdfFilesStatus, {});
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const savePdfFile = useMutation(api.bookAccess.savePdfFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await savePdfFile({ language, storageId });
      toast.success(
        `${language === "zh" ? "中文" : "English"} PDF uploaded.`,
      );
    } catch {
      toast.error("Could not upload this PDF.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <FileDown className="size-5 text-primary" />
        PDF keepsake download (paid add-on)
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload the actual manuscript PDF per language — the same file used to
        generate the page-flip images above. Only a buyer with the PDF
        add-on unlocked (see "Grant access" above, or the checkbox in
        "Grant access directly" below) sees a "Download PDF" button at
        /library; everyone else only sees the on-screen page-flip reader.
        Re-uploading replaces the file in place. This upload is the clean
        master copy — each buyer who clicks "Download PDF" gets their own
        copy with "Office Original · their email" stamped diagonally across
        every page (generated the first time they click, see
        convex/bookPdfWatermark.ts — deliberately a big stamp through the
        page, not a small line at the bottom, since that could just be
        cropped off), so nothing unwatermarked ever leaves this upload.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as "en" | "zh")}
        >
          <SelectTrigger className="w-32 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button
          variant="secondary"
          className="cursor-pointer"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "Uploading…" : "Upload PDF"}
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {status === undefined
          ? "Loading current status…"
          : `Currently uploaded: 中文 ${
              status.zh ? "✓ ready" : "not uploaded yet"
            } · English ${status.en ? "✓ ready" : "not uploaded yet"}.`}
      </p>
    </div>
  );
}

// Tier 3's deliverable since the 2026-10-26 pivot: a shared pool of
// pre-made desktop wallpapers every Tier 3 buyer can browse and download
// from /library's "Wallpapers" tab (see getWallpapers in
// convex/bookAccess.ts), instead of a one-off image made by hand per order
// — upload a batch here once rather than fulfilling each order yourself.
// Added 2026-10-31 — turns a filename into a usable label for batch
// uploads ("monday-reset_v2.png" -> "monday reset v2"). Only used when the
// admin selects more than one file at once (see handleFiles below) — a
// single-file upload still uses whatever she types in the Label field, same
// as before this batch feature existed.
function filenameToLabel(filename: string): string {
  const withoutExt = filename.replace(/\.[^./\\]+$/, "");
  return withoutExt.replace(/[_-]+/g, " ").trim();
}

// Added 2026-10-31, alongside renameWallpaper in convex/bookAccess.ts — the
// client's batch of ~50 wallpaper filenames (hence labels, via
// filenameToLabel above) came out with inconsistent capitalization: some
// ALL CAPS, some Title Case, most already correct "Sentence case". This
// normalizes any label to sentence case — capitalize the first letter of
// the whole string, lowercase the rest, then re-capitalize the first
// letter after any ". "/"! "/"? " so a label with more than one sentence
// doesn't lose its second sentence's capital (e.g. "Evaluate the cost
// before you cooperate. Maybe you can afford it." keeps "Maybe" capitalized
// rather than becoming "maybe"). Used by the "Fix capitalization" bulk
// action below — it never touches the image file, only the label text.
function smartSentenceCase(label: string): string {
  if (!label) return label;
  let s = label.toLowerCase();
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s = s.replace(
    /([.!?]\s+)([a-z])/g,
    (_match, sep: string, letter: string) => sep + letter.toUpperCase(),
  );
  return s;
}

function WallpaperLibraryManager() {
  const wallpapers = useQuery(api.bookAccess.listWallpapersAdmin, {});
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const addWallpaper = useMutation(api.bookAccess.addWallpaper);
  const removeWallpaper = useMutation(api.bookAccess.removeWallpaper);
  const renameWallpaper = useMutation(api.bookAccess.renameWallpaper);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fixingCase, setFixingCase] = useState(false);
  // Added 2026-10-31 — inline per-wallpaper label edit (pencil icon below),
  // for the one-off case the bulk "Fix capitalization" button doesn't cover
  // (an actual typo or wording change, not just casing).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Added 2026-10-31 — the admin used to only be able to pick one image at
  // a time (no `multiple` on the <input> below). Now handles any number of
  // files, uploading them one at a time (sequential, not parallel, so we
  // don't hammer Convex storage with a burst of simultaneous requests) and
  // reporting progress. When more than one file is selected, the Label
  // field is ignored in favor of each file's own filename (requested by the
  // client 2026-10-31 — a single shared label on a batch of different
  // wallpapers isn't useful, and there's no per-file label input in this
  // picker). A single-file selection keeps the old behavior exactly:
  // whatever's typed in the Label field, or blank.
  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const isBatch = files.length > 1;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    let successCount = 0;
    try {
      for (const file of files) {
        try {
          const uploadUrl = await generateUploadUrl({});
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!res.ok) throw new Error("Upload failed");
          const { storageId } = await res.json();
          const fileLabel = isBatch
            ? filenameToLabel(file.name)
            : label.trim() || undefined;
          await addWallpaper({ storageId, label: fileLabel || undefined });
          successCount++;
        } catch {
          toast.error(`Could not upload "${file.name}".`);
        } finally {
          setUploadProgress((prev) =>
            prev ? { ...prev, done: prev.done + 1 } : prev,
          );
        }
      }
      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? "Wallpaper added."
            : `${successCount} wallpapers added.`,
        );
      }
      setLabel("");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (wallpaperId: string) => {
    setBusyId(wallpaperId);
    try {
      await removeWallpaper({
        wallpaperId: wallpaperId as Parameters<
          typeof removeWallpaper
        >[0]["wallpaperId"],
      });
    } catch {
      toast.error("Could not remove this wallpaper.");
    } finally {
      setBusyId(null);
    }
  };

  // Added 2026-10-31 — goes through every wallpaper already in the pool and
  // re-saves its label through smartSentenceCase, skipping any that are
  // already correct. Only touches the `label` field (via renameWallpaper,
  // not addWallpaper/removeWallpaper) — the image itself, its storageId,
  // and its position in the list are all untouched, so there's no risk of
  // ending up with duplicates the way deleting and re-uploading every file
  // would be.
  const handleFixCapitalization = async () => {
    if (!wallpapers || wallpapers.length === 0) return;
    setFixingCase(true);
    let fixedCount = 0;
    try {
      for (const w of wallpapers) {
        const current = w.label ?? "";
        const fixed = smartSentenceCase(current);
        if (fixed && fixed !== current) {
          try {
            await renameWallpaper({
              wallpaperId: w._id as Parameters<
                typeof renameWallpaper
              >[0]["wallpaperId"],
              label: fixed,
            });
            fixedCount++;
          } catch {
            toast.error(`Could not fix the label for "${current}".`);
          }
        }
      }
      toast.success(
        fixedCount > 0
          ? `Fixed capitalization on ${fixedCount} label${fixedCount === 1 ? "" : "s"}.`
          : "All labels already look consistent — nothing to fix.",
      );
    } finally {
      setFixingCase(false);
    }
  };

  const startEditing = (wallpaperId: string, currentLabel: string) => {
    setEditingId(wallpaperId);
    setEditValue(currentLabel);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEditing = async (wallpaperId: string) => {
    setBusyId(wallpaperId);
    try {
      await renameWallpaper({
        wallpaperId: wallpaperId as Parameters<
          typeof renameWallpaper
        >[0]["wallpaperId"],
        label: editValue,
      });
      setEditingId(null);
      setEditValue("");
    } catch {
      toast.error("Could not save this label.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
        <ImageIcon className="size-5 text-primary" />
        Wallpaper library
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload the pre-made desktop wallpapers Tier 3 buyers can browse and
        download at /library — every Tier 3 buyer sees the same shared
        pool, so upload once here rather than per order. An optional label
        shows under each image both here and at /library.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        You can select multiple images at once — the Label field below only
        applies when uploading a single image; for a multi-image batch, each
        wallpaper is labeled from its own filename instead (rename the files
        beforehand if you want specific labels).
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder='Label (optional, single-image only) — e.g. "Monday Reset"'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="sm:flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) handleFiles(files);
          }}
        />
        <Button
          variant="secondary"
          className="cursor-pointer"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploadProgress
            ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
            : "Upload image(s)"}
        </Button>
      </div>

      {wallpapers !== undefined && wallpapers.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={fixingCase}
            onClick={handleFixCapitalization}
          >
            <SpellCheck className="size-3.5" />
            {fixingCase ? "Fixing…" : "Fix capitalization"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Rewrites every label below to sentence case (first letter
            capitalized, rest lowercase) — only the label text changes, not
            the images.
          </p>
        </div>
      )}

      {wallpapers === undefined ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-lg" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <Empty className="mt-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>No wallpapers yet</EmptyTitle>
            <EmptyDescription>
              Upload at least one image above — Tier 3 buyers see an empty
              "check back soon" message at /library until then.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {wallpapers.map((w) => (
            <div
              key={w._id}
              className="overflow-hidden rounded-lg border border-border bg-background"
            >
              <img
                src={w.url}
                alt={w.label || "Wallpaper"}
                className="aspect-video w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-2.5">
                {editingId === w._id ? (
                  <>
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditing(w._id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="h-7 flex-1 text-xs"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 cursor-pointer"
                      disabled={busyId === w._id}
                      onClick={() => saveEditing(w._id)}
                      aria-label="Save label"
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 cursor-pointer"
                      disabled={busyId === w._id}
                      onClick={cancelEditing}
                      aria-label="Cancel"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="truncate text-xs text-muted-foreground">
                      {w.label || "Untitled"}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 cursor-pointer"
                      disabled={busyId === w._id}
                      onClick={() => startEditing(w._id, w.label ?? "")}
                      aria-label="Edit label"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 cursor-pointer text-destructive hover:text-destructive"
                      disabled={busyId === w._id}
                      onClick={() => handleRemove(w._id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
