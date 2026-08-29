import { useContext } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { ContentContext } from "@/hooks/use-content.ts";
import { PAGE_SCHEMAS, type PageSchema } from "../_lib/content-schema.ts";
import TextFieldEditor from "./text-field-editor.tsx";
import MediaFieldEditor from "./media-field-editor.tsx";

type ContentEditorProps = {
  pageId: string;
  /** Which language's schema to render. Defaults to the English schema. */
  schemas?: PageSchema[];
};

/**
 * Renders all editable text and media fields for a given page, grouped by
 * section in a collapsible accordion. Reads current overrides from the shared
 * ContentContext so edits reflect live.
 */
export default function ContentEditor({
  pageId,
  schemas = PAGE_SCHEMAS,
}: ContentEditorProps) {
  const { content, media } = useContext(ContentContext);
  const page = schemas.find((p) => p.id === pageId);

  if (!page) return null;

  return (
    <Accordion type="multiple" className="space-y-3">
      {page.groups.map((group, i) => (
        <AccordionItem
          key={`${pageId}-${i}`}
          value={`${pageId}-${i}`}
          className="rounded-xl border border-border bg-card px-5"
        >
          <AccordionTrigger className="cursor-pointer py-4 text-left font-serif text-lg font-semibold hover:no-underline">
            {group.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pb-6">
            {group.description && (
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
            {group.textFields.length > 0 && (
              <div className="space-y-5">
                {group.textFields.map((field) => (
                  <TextFieldEditor
                    key={field.key}
                    field={field}
                    current={content?.[field.key]}
                  />
                ))}
              </div>
            )}
            {group.mediaFields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {group.mediaFields.map((field) => (
                  <MediaFieldEditor
                    key={field.key}
                    field={field}
                    current={media?.[field.key]}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
