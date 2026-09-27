import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import {
  BadgeCheck,
  Ban,
  Copy,
  Inbox,
  KeyRound,
  Link2,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";
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
type Product = "book" | "consulting-two" | "consulting-five" | "consulting-ten";

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  zh: "中文",
  both: "English + 中文",
};

const PRODUCT_LABEL: Record<Product, string> = {
  book: "Book",
  "consulting-two": "Consulting — Two-Pack",
  "consulting-five": "Consulting — Five-Pack",
  "consulting-ten": "Consulting — Ten-Pack",
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
    </div>
  );
}

function PendingNotices() {
  const notices = useQuery(api.bookAccess.listPurchaseNotices, {
    status: "pending",
  });
  const grant = useMutation(api.bookAccess.grantAccess);
  const dismiss = useMutation(api.bookAccess.dismissPurchaseNotice);
  const [languageByNotice, setLanguageByNotice] = useState<
    Record<string, Language>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleGrant = async (noticeId: string, email: string) => {
    const language = languageByNotice[noticeId] ?? "en";
    setBusyId(noticeId);
    try {
      await grant({
        email,
        language,
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
        Buyers who said they've sent the bank transfer. Check your Wise /
        bank statement for a matching deposit before granting — this is the
        one manual step the whole flow relies on.
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
              New purchase notices from /book-consult will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 space-y-3">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-card-foreground">
                    {notice.name ? `${notice.name} — ${notice.email}` : notice.email}
                  </p>
                  {notice.note && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      "{notice.note}"
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-1.5 align-middle">
                      {PRODUCT_LABEL[notice.product as Product]}
                    </Badge>
                    {notice.requestedLanguage &&
                      `Requested ${LANGUAGE_LABEL[notice.requestedLanguage]} · `}
                    {format(new Date(notice._creationTime), "PPp")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {notice.product === "book" ? (
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
                        onClick={() => handleGrant(notice._id, notice.email)}
                      >
                        <BadgeCheck className="size-4" />
                        Grant access
                      </Button>
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
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="cursor-pointer"
                      disabled={busyId === notice._id}
                      onClick={() => handleDismiss(notice._id)}
                    >
                      <BadgeCheck className="size-4" />
                      Mark as contacted
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManualGrantForm() {
  const grant = useMutation(api.bookAccess.grantAccess);
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter an email address.");
      return;
    }
    setSubmitting(true);
    try {
      await grant({ email: trimmed, language });
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
        <Button onClick={handleSubmit} disabled={submitting} className="cursor-pointer">
          Grant &amp; email code
        </Button>
      </div>
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

  const handleResend = async (email: string, language: Language) => {
    setBusyEmail(email);
    try {
      await regrant({ email, language });
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
          {grants.map((g) => (
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
                  <Badge variant="secondary">{LANGUAGE_LABEL[g.language]}</Badge>
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
                  onClick={() => handleResend(g.email, g.language)}
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
          ))}
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
        Shown to a buyer only after they submit their email on /book-consult
        — never on any public page (see claude/16_payment_processor_decision.md).
        Paste a Wise "request money" link per product; leave blank to fall
        back to the hardcoded default in convex/bookAccess.ts.
      </p>

      {links === undefined ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
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
