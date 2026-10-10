import { useContext, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ContentContext } from "@/hooks/use-content.ts";

export const SHOP_ENABLED_KEY = "site.shopEnabled";

/**
 * Admin-only switch for the /shop storefront (replaces the retired
 * book-site-toggle.tsx, which gated the old /book-consult three-tier
 * funnel — that page lost its route in the 2026-10-09 /shop pivot, so its
 * toggle stopped doing anything). /book-consult still redirects to /shop
 * (see App.tsx), so turning this off also hides the page for anyone
 * following an old /book-consult link.
 *
 * Defaults OFF as of the 2026-10-10 Bizlegate/Office Original separation
 * decision (see the project's claude/22_shop_office_original_separation_
 * strategy.md doc) — the plan going forward is to keep book/merch sales
 * off bizlegate.com entirely and sell through Office Original's YouTube
 * and Facebook native shopping instead, with Bizlegate appearing there
 * only as a sponsor rather than as the same owner. /shop and /book-consult
 * stay in the codebase as a fallback, just not shown by default anymore.
 * Flip this on from here any time to bring either page back.
 */
export default function ShopSiteToggle() {
  const { content } = useContext(ContentContext);
  const setContent = useMutation(api.content.setContent);
  const [saving, setSaving] = useState(false);

  const enabled = content?.[SHOP_ENABLED_KEY] === "true";

  const handleChange = async (checked: boolean) => {
    setSaving(true);
    try {
      await setContent({ key: SHOP_ENABLED_KEY, value: checked ? "true" : "false" });
      toast.success(checked ? "商店頁面已上線" : "商店頁面已隱藏");
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
          <ShoppingBag className="size-4" />
        </div>
        <div>
          <Label className="text-sm font-medium">商店頁面(/shop)</Label>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {enabled
              ? "頁面目前是公開狀態,任何人打開 /shop(或舊的 /book-consult 連結)都看得到完整商店頁。"
              : "頁面目前是隱藏狀態,打開 /shop 或 /book-consult 只會看到「即將推出」,看不到任何內容——適合先在後台把文案調好,準備好再打開。"}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={saving}
        aria-label="開啟商店頁面"
      />
    </div>
  );
}
