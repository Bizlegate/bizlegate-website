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
 * Admin-only switch for the /book sales page. Defaults OFF (unlike the zh
 * toggle, which defaults ON) — this is a brand-new page that hasn't
 * launched yet, so it should stay hidden behind a "coming soon" placeholder
 * until the admin is ready to send traffic to it.
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
              ? "頁面目前是公開狀態,任何人打開 /book 都看得到完整銷售頁。"
              : "頁面目前是隱藏狀態,打開 /book 只會看到「即將推出」,看不到任何內容——適合先在後台把文案調好,準備好再打開。"}
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
