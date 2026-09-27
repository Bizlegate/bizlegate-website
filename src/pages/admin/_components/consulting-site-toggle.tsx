import { useContext, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { MessagesSquare } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ContentContext } from "@/hooks/use-content.ts";

export const CONSULTING_ENABLED_KEY = "site.consultingEnabled";

/**
 * Admin-only switch for the two consulting sections on /book-consult (the
 * regular-price grid mid-page and the sale-price repeat near the bottom —
 * see book-consulting.tsx / book-consulting-sale.tsx). Defaults OFF: the
 * consulting offer is 1:1 email guidance, which trades time for money and
 * doesn't scale the way the book itself does, so the plan is to sell the
 * book first and only turn consulting back on if/when there's bandwidth for
 * it (or bring back something merch-like instead). Turning this off does
 * NOT delete any consulting copy/pricing — those CMS fields, and the tiers'
 * Wise payment links in the Book Access panel, are untouched and ready to
 * go the moment this is switched back on.
 */
export default function ConsultingSiteToggle() {
  const { content } = useContext(ContentContext);
  const setContent = useMutation(api.content.setContent);
  const [saving, setSaving] = useState(false);

  const enabled = content?.[CONSULTING_ENABLED_KEY] === "true";

  const handleChange = async (checked: boolean) => {
    setSaving(true);
    try {
      await setContent({
        key: CONSULTING_ENABLED_KEY,
        value: checked ? "true" : "false",
      });
      toast.success(checked ? "諮詢方案已上線" : "諮詢方案已隱藏");
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
          <MessagesSquare className="size-4" />
        </div>
        <div>
          <Label className="text-sm font-medium">諮詢方案(Two/Five/Ten-Pack)</Label>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {enabled
              ? "/book-consult 頁面上會顯示兩組諮詢方案區塊(原價區 + 促銷區),訪客可以購買。"
              : "兩組諮詢方案區塊目前都隱藏,/book-consult 只會顯示書籍本身——文案、價格、Wise 收款連結都還在,之後隨時可以打開恢復銷售。"}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={saving}
        aria-label="開啟諮詢方案"
      />
    </div>
  );
}
