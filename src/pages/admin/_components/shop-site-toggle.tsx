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
 * Defaults ON (unlike the old book toggle, which defaulted off) because
 * /shop is already live when this ships — flipping the default to off
 * here would silently take down a page that's currently working.
 */
export default function ShopSiteToggle() {
  const { content } = useContext(ContentContext);
  const setContent = useMutation(api.content.setContent);
  const [saving, setSaving] = useState(false);

  const enabled = content?.[SHOP_ENABLED_KEY] !== "false";

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
