import { useContext, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ContentContext } from "@/hooks/use-content.ts";

export const BOOK_ENABLED_KEY = "site.bookEnabled";

/**
 * Admin-only switch for the /book sales page (the original three-tier
 * book funnel — pages/book/page.tsx and friends).
 *
 * Briefly orphaned around the 2026-10-09 /shop pivot, when its URL
 * (/book-consult at the time) was changed to unconditionally redirect to
 * /shop and this toggle's target page lost its route. Restored on
 * 2026-10-10: the user liked the original page and didn't want it reduced
 * to a redirect, so it came back as its own real route (see App.tsx) with
 * this toggle controlling it independently of ShopSiteToggle/
 * site.shopEnabled, which controls only /shop. Renamed from /book-consult
 * back to plain /book on 2026-10-26 — the user decided she isn't selling
 * the "consultation" framing after all — with /book-consult kept as a
 * redirect to /book so the URL already printed on the book's back cover
 * and Office Original video end-cards doesn't break. See
 * claude/22_shop_office_original_separation_strategy.md — both /book and
 * /shop are kept as fallbacks, hidden by default, switchable from /admin
 * without code changes.
 *
 * Defaults OFF (unlike the zh toggle, which defaults ON) — consistent
 * with the 2026-10-10 decision to keep book/merch sales off bizlegate.com
 * by default in favor of Office Original's own channels.
 */
export default function BookSiteToggle() {
  const { content } = useContext(ContentContext);
  const setContent = useMutation(api.content.setContent);
  const [saving, setSaving] = useState(false);

  const enabled = content?.[BOOK_ENABLED_KEY] === "true";

  const handleChange = async (checked: boolean) => {
    setSaving(true);
    try {
      await setContent({ key: BOOK_ENABLED_KEY, value: checked ? "true" : "false" });
      toast.success(checked ? "書籍頁面已上線" : "書籍頁面已隱藏");
    } catch {
      toast.error("無法儲存,請再試一次");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <BookOpen className="size-4" />
        </div>
        <div>
          <Label className="text-sm font-medium">書籍銷售頁面(/book)</Label>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {enabled
              ? "頁面目前是公開狀態,任何人打開 /book(或舊的 /book-consult 連結)都看得到完整銷售頁。"
              : "頁面目前是隱藏狀態,打開 /book 或 /book-consult 只會看到「即將推出」,看不到任何內容——適合先在後台把文案調好,準備好再打開。"}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={saving}
        aria-label="開啟書籍銷售頁面"
      />
    </div>
  );
}
