import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Check, RotateCcw } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { type TextField } from "../_lib/content-schema.ts";

type TextFieldEditorProps = {
  field: TextField;
  /** Current stored override value, or undefined if using the default. */
  current: string | undefined;
};

/**
 * Edits a single text/textarea content field. Saves overrides to the backend
 * and can reset back to the code default.
 */
export default function TextFieldEditor({
  field,
  current,
}: TextFieldEditorProps) {
  const setContent = useMutation(api.content.setContent);
  const clearContent = useMutation(api.content.clearContent);
  const initial = current ?? field.fallback;
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  const dirty = value !== initial;
  const isOverridden = current !== undefined && current !== "";

  const handleSave = async () => {
    setSaving(true);
    try {
      await setContent({ key: field.key, value });
      toast.success("Saved");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await clearContent({ key: field.key });
      setValue(field.fallback);
      toast.success("Reset to default");
    } catch {
      toast.error("Could not reset. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{field.label}</Label>
        {isOverridden && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-primary">
            Edited
          </span>
        )}
      </div>
      {field.kind === "textarea" ? (
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="resize-none"
        />
      ) : (
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      )}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="cursor-pointer"
        >
          {saving ? (
            <Spinner className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          Save
        </Button>
        {isOverridden && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={saving}
            className="cursor-pointer text-muted-foreground"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
