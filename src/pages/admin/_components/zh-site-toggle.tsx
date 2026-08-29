import { useContext, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ContentContext, ZH_ENABLED_KEY } from "@/hooks/use-content.ts";

/**
 * Admin-only kill switch for the whole Chinese site. Turning this off does
 * NOT delete any Chinese content — it just hides the navbar language toggle
 * and forces every visitor to see the English site, even one whose browser
 * already remembers a "zh" choice from before. Turning it back on restores
 * everything exactly as it was, since nothing was removed.
 */
export default function ZhSiteToggle() {
  const { content } = useContext(ContentContext);
  const setContent = useMutation(api.content.setContent);
  const [saving, setSaving] = useState(false);

  const enabled = content?.[ZH_ENABLED_KEY] !== "false";

  const handleChange = async (checked: boolean) => {
    setSaving(true);
    try {
      await setContent({ key: ZH_ENABLED_KEY, value: checked ? "true" : "false" });
      toast.success(checked ? "中文網站已開啟" : "中文網站已隱藏");
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
          <Globe className="size-4" />
        </div>
        <div>
          <Label className="text-sm font-medium">中文網站</Label>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {enabled
              ? "訪客可以在網站右上角切換成中文。關閉後,語言切換按鈕會隱藏,所有訪客只會看到英文版 — 中文內容不會被刪除,之後隨時可以再打開。"
              : "中文版目前已隱藏,所有訪客只會看到英文版。中文內容都還在,打開後即可恢復語言切換按鈕。"}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={saving}
        aria-label="開啟中文網站"
      />
    </div>
  );
}
