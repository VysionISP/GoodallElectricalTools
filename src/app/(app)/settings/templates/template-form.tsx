"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import type { ReportTemplate, ToolType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";
import {
  ACCENT_SWATCHES,
  COLUMN_DEFS,
  DEFAULT_ACCENT_COLOR,
  HEADER_LAYOUTS,
  parseHeaderLayout,
  parseTemplateColumns,
} from "@/lib/report-template-config";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  const refreshPreview = useCallback(async () => {
    if (!formRef.current) return;
    const seq = ++requestSeq.current;
    setPreviewBusy(true);
    try {
      const formData = new FormData(formRef.current);
      const res = await fetch("/api/settings/templates/preview", { method: "POST", body: formData });
      if (!res.ok) throw new Error("preview failed");
      const blob = await res.blob();
      if (seq !== requestSeq.current) return; // a newer request superseded this one
      const url = URL.createObjectURL(blob);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
      setPreviewError(null);
    } catch {
      if (seq === requestSeq.current) setPreviewError("Preview couldn't refresh — check your inputs.");
    } finally {
      if (seq === requestSeq.current) setPreviewBusy(false);
    }
  }, []);

  // First render + every form change (debounced) re-renders the preview.
  useEffect(() => {
    void refreshPreview();
  }, [refreshPreview]);

  const schedulePreview = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void refreshPreview(), 500);
  };

  async function openInNewTab() {
    if (!formRef.current) return;
    const previewWindow = window.open("", "_blank");
    try {
      const formData = new FormData(formRef.current);
      const res = await fetch("/api/settings/templates/preview", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (previewWindow) previewWindow.location.href = url;
    } catch {
      previewWindow?.close();
      setPreviewError("Could not generate preview. Check your inputs and try again.");
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
      <Card className="p-5">
        <form ref={formRef} action={formAction} onInput={schedulePreview} onChange={schedulePreview} className="space-y-5">
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
            <Label>Header layout</Label>
            <p className="mb-2 text-xs text-slate-500">
              Where the logos and business details sit — the preview updates as you pick.
            </p>
            <div className="space-y-2">
              {HEADER_LAYOUTS.map((layout) => (
                <label
                  key={layout.key}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-2.5 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name="headerLayout"
                    value={layout.key}
                    defaultChecked={parseHeaderLayout(template?.headerLayout) === layout.key}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium text-slate-900">{layout.label}</span>
                    <span className="block text-xs text-slate-500">{layout.description}</span>
                  </span>
                </label>
              ))}
            </div>
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
                defaultValue={template?.accentColor ?? DEFAULT_ACCENT_COLOR}
              />
              <div className="flex gap-1.5">
                {ACCENT_SWATCHES.map((c) => (
                  <label
                    key={c}
                    className="h-7 w-7 cursor-pointer rounded-full border border-slate-200"
                    style={{ backgroundColor: c }}
                  >
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
                        schedulePreview();
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">Used for the report title and header rule.</p>
          </div>

          <div className="space-y-2">
            <Label>Layout options</Label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="showStatCards" defaultChecked={template?.showStatCards ?? true} />
              Show pass/fail summary cards
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="showPhotos" defaultChecked={template?.showPhotos ?? true} />
              Include before/after photos in the Repairs Required section
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="showCustomerLogo"
                defaultChecked={template?.showCustomerLogo ?? true}
              />
              Show the customer&apos;s logo (when they have one uploaded)
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
            <Button type="button" variant="secondary" onClick={openInNewTab}>
              Open preview in new tab
            </Button>
          </div>
        </form>
      </Card>

      <div className="sticky top-6 hidden xl:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Live preview</p>
          <p className="text-xs text-slate-400">{previewBusy ? "Updating…" : "Sample data"}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0`}
              title="Template preview"
              className="h-[80vh] w-full"
            />
          ) : (
            <div className="flex h-[80vh] items-center justify-center text-sm text-slate-400">
              {previewError ?? "Generating preview…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
