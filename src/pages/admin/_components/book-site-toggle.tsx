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
 * RETIRED (2026-10-09 /shop pivot) — no longer imported anywhere. /book-
 * consult now unconditionally redirects to /shop (see App.tsx), and the
 * old three-tier book funnel this toggle gated (pages/book/page.tsx) has
 * no route pointing at it anymore, so flipping this switch has zero
 * visible effect on the live site. Replaced by ShopSiteToggle
 * (admin/_components/shop-site-toggle.tsx, site.shopEnabled), which gates
 * /shop itself. Left on disk per the site's "stub out, don't delete"
 * convention — safe to delete by hand whenever, same as
 * book-consulting.tsx.
 *
 * Original doc, for history: admin-only switch for the /book-consult
 * sales page. Defaulted OFF (unlike the zh toggle, which defaults ON) —
 * it was a brand-new page that hadn't launched yet, so it stayed hidden
 * behind a "coming soon" placeholder until the admin was ready to send
 * traffic to it.
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
          <Label className="text-sm font-medium">書籍銷售頁面(/book-consult)</Label>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {enabled
              ? "頁面目前是公開狀態,任何人打開 /book-consult 都看得到完整銷售頁。"
              : "頁面目前是隱藏狀態,打開 /book-consult 只會看到「即將推出」,看不到任何內容——適合先在後台把文案調好,準備好再打開。"}
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
