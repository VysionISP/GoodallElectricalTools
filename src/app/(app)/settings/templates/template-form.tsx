"use client";

import { useActionState, useRef, useState } from "react";
import type { ReportTemplate, ToolType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";
import { ACCENT_SWATCHES, COLUMN_DEFS, parseTemplateColumns } from "@/lib/report-template-config";

export function TemplateForm({
  toolType,
  template,
  action,
  submitLabel,
}: {
  toolType: ToolType;
  template?: ReportTemplate;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, undefined);
  const columns = COLUMN_DEFS[toolType];
  const selectedColumns = new Set(parseTemplateColumns(toolType, template?.tableColumns));
  const formRef = useRef<HTMLFormElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function handlePreview() {
    if (!formRef.current) return;
    setPreviewing(true);
    setPreviewError(null);
    // Open the tab synchronously (before the await) so browsers don't treat
    // it as an unrequested popup and block it.
    const previewWindow = window.open("", "_blank");
    try {
      const formData = new FormData(formRef.current);
      const res = await fetch("/api/settings/templates/preview", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Could not generate preview.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (previewWindow) previewWindow.location.href = url;
      else setPreviewError("Your browser blocked the preview tab — allow pop-ups and try again.");
    } catch {
      previewWindow?.close();
      setPreviewError("Could not generate preview. Check your inputs and try again.");
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <Card className="p-5 max-w-xl">
      <form ref={formRef} action={formAction} className="space-y-5">
        <input type="hidden" name="toolType" value={toolType} />
        <div>
          <Label htmlFor="name">Template name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Standard, Managed Buildings Co."
            defaultValue={template?.name}
            required
          />
        </div>

        <div>
          <Label htmlFor="accentColor">Accent color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="accentColor"
              name="accentColor"
              type="text"
              pattern="#[0-9a-fA-F]{6}"
              className="w-32"
              defaultValue={template?.accentColor ?? "#047857"}
            />
            <div className="flex gap-1.5">
              {ACCENT_SWATCHES.map((c) => (
                <label key={c} className="h-7 w-7 cursor-pointer rounded-full border border-slate-200" style={{ backgroundColor: c }}>
                  <input
                    type="radio"
                    name="accentColorSwatch"
                    value={c}
                    className="sr-only"
                    onClick={(e) => {
                      const input = (e.currentTarget.closest("form") as HTMLFormElement).querySelector<HTMLInputElement>(
                        "#accentColor"
                      );
                      if (input) input.value = c;
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">Used for the report title and header rule.</p>
        </div>

        <div className="space-y-2">
          <Label>Layout</Label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="showStatCards" defaultChecked={template?.showStatCards ?? true} />
            Show pass/fail summary cards
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="showPhotos" defaultChecked={template?.showPhotos ?? true} />
            Include before/after photos in the Repairs Required section
          </label>
        </div>

        <div className="space-y-2">
          <Label>Results table columns</Label>
          <p className="text-xs text-slate-500">Reference and result are always shown.</p>
          {columns.map((c) => (
            <label key={c.key} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="columns" value={c.key} defaultChecked={selectedColumns.has(c.key)} />
              {c.label}
            </label>
          ))}
        </div>

        <div>
          <Label htmlFor="headerText">Header text (optional)</Label>
          <Input
            id="headerText"
            name="headerText"
            placeholder="A short line shown under the report title"
            defaultValue={template?.headerText ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="footerText">Footer text (optional)</Label>
          <Input
            id="footerText"
            name="footerText"
            placeholder="Overrides the default business name / REC / ABN footer line"
            defaultValue={template?.footerText ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="disclaimerText">Disclaimer / compliance statement (optional)</Label>
          <Textarea
            id="disclaimerText"
            name="disclaimerText"
            rows={3}
            placeholder="Shown at the end of the report"
            defaultValue={template?.disclaimerText ?? ""}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isDefault" defaultChecked={template?.isDefault ?? false} />
          Use as the default template for this tool
        </label>

        <ErrorText>{state?.error}</ErrorText>
        <ErrorText>{previewError}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
          <Button type="button" variant="secondary" disabled={previewing} onClick={handlePreview}>
            {previewing ? "Generating..." : "Preview PDF"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
