import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { RotateCcw, Upload, Link2 } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { type MediaValue } from "@/hooks/use-content.ts";
import { toYouTubeEmbed } from "@/components/media/editable-media.tsx";
import { type MediaField } from "../_lib/content-schema.ts";

type MediaFieldEditorProps = {
  field: MediaField;
  current: MediaValue | undefined;
};

/**
 * Edits a single media field. Supports uploading an image/video file directly,
 * or pasting an image / YouTube URL. Can reset back to the code default.
 */
export default function MediaFieldEditor({
  field,
  current,
}: MediaFieldEditorProps) {
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const setMediaFromStorage = useMutation(api.content.setMediaFromStorage);
  const setMedia = useMutation(api.content.setMedia);
  const clearMedia = useMutation(api.content.clearMedia);
  const fileInput = useRef<HTMLInputElement>(null);

  const [urlValue, setUrlValue] = useState(current?.url ?? field.fallbackUrl);
  const [busy, setBusy] = useState(false);

  const isOverridden = current !== undefined;
  const previewUrl = current?.url ?? field.fallbackUrl;
  const previewType = current?.type ?? "image";
  const embed = previewType === "youtube" ? toYouTubeEmbed(previewUrl) : null;

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    setBusy(true);
    try {
      const postUrl = await generateUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await setMediaFromStorage({
        key: field.key,
        storageId,
        type: isVideo ? "video" : "image",
      });
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleSaveUrl = async () => {
    setBusy(true);
    try {
      const type = toYouTubeEmbed(urlValue) ? "youtube" : "image";
      await setMedia({ key: field.key, url: urlValue, type });
      toast.success("Saved");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    try {
      await clearMedia({ key: field.key });
      setUrlValue(field.fallbackUrl);
      toast.success("Reset to default");
    } catch {
      toast.error("Could not reset. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{field.label}</Label>
        {isOverridden && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-primary">
            Edited
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-muted">
        {embed ? (
          <div className="aspect-video">
            <iframe
              src={embed}
              title={field.label}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        ) : previewType === "video" ? (
          <video src={previewUrl} controls className="aspect-video w-full" />
        ) : (
          <img
            src={previewUrl}
            alt={field.label}
            className="aspect-video w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="cursor-pointer"
        >
          {busy ? <Spinner className="size-4" /> : <Upload className="size-4" />}
          Upload file
        </Button>
        {isOverridden && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={busy}
            className="cursor-pointer text-muted-foreground"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link2 className="size-3.5" />
          Or paste an image / YouTube URL
        </Label>
        <div className="flex gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://..."
            className="text-sm"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSaveUrl}
            disabled={busy || urlValue.trim() === ""}
            className="cursor-pointer"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
