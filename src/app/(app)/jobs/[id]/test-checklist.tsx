"use client";

import { useActionState, useState, type ReactNode } from "react";
import Image from "next/image";
import type { Fitting, FittingTestResult, FittingType, TestType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { saveFittingTestResultAction } from "@/lib/actions/jobs";
import { Badge, Button, Card, ErrorText, Input, Label, Select, Textarea } from "@/components/ui";
import { CameraIcon, CheckIcon, XIcon } from "@/components/icons";

const TYPE_LABELS: Record<FittingType, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined exit/EL",
};

// AS/NZS 2293.2: the 6-monthly routine is the discharge/duration test; the
// detailed condition items belong to the annual inspection. The checklist
// shown per fitting follows the job's test type.
const DURATION_ITEM = { key: "durationTestPass", label: "Duration / discharge test (90 min)" };
const ANNUAL_ITEMS: { key: string; label: string }[] = [
  { key: "illuminationPass", label: "Illumination level adequate" },
  { key: "batteryConditionPass", label: "Battery condition" },
  { key: "lampConditionPass", label: "Lamp / LED condition" },
  { key: "physicalDamagePass", label: "No physical damage" },
  { key: "signageVisiblePass", label: "Signage clean & visible" },
];

function checklistItemsFor(testType: TestType | null) {
  return testType === "ANNUAL_FULL_TEST" ? [DURATION_ITEM, ...ANNUAL_ITEMS] : [DURATION_ITEM];
}

export function TestChecklist({
  jobId,
  testType,
  fittings,
  results,
}: {
  jobId: string;
  testType: TestType | null;
  fittings: Fitting[];
  results: FittingTestResult[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const resultByFitting = new Map(results.map((r) => [r.fittingId, r]));

  // A result row can exist purely from the energised pre-check (before any
  // discharge testing), so "tested" means the discharge result was actually
  // recorded, not just that a row exists.
  const tested = fittings.filter((f) => resultByFitting.get(f.id)?.durationTestPass != null).length;
  const failCount = results.filter(
    (r) => r.durationTestPass != null && r.overallResult !== "PASS"
  ).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Fittings tested{" "}
          <span className="text-slate-400 font-normal">
            ({tested}/{fittings.length})
          </span>
        </h2>
        {failCount > 0 && <Badge color="red">{failCount} need attention</Badge>}
      </div>

      {fittings.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          This site has no fittings recorded yet. Add fittings from the site page first.
        </Card>
      ) : (
        <div className="space-y-3">
          {fittings.map((f) =>
            openId === f.id ? (
              <FittingTestForm
                key={f.id}
                jobId={jobId}
                testType={testType}
                fitting={f}
                result={resultByFitting.get(f.id)}
                onDone={() => setOpenId(null)}
              />
            ) : (
              <FittingRow
                key={f.id}
                fitting={f}
                result={resultByFitting.get(f.id)}
                onOpen={() => setOpenId(f.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function FittingRow({
  fitting,
  result,
  onOpen,
}: {
  fitting: Fitting;
  result?: FittingTestResult;
  onOpen: () => void;
}) {
  return (
    <Card
      className="flex cursor-pointer items-center gap-3 p-3 hover:border-brand-300"
      onClick={onOpen}
    >
      {fitting.photoPath ? (
        <Image
          src={fitting.photoPath}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover border border-slate-100 shrink-0"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-300">
          <CameraIcon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{fitting.reference}</p>
          <span className="text-xs text-slate-400">{TYPE_LABELS[fitting.fittingType]}</span>
        </div>
        <p className="truncate text-xs text-slate-500">{fitting.location}</p>
      </div>
      <ResultBadge result={result} />
    </Card>
  );
}

function ResultBadge({ result }: { result?: FittingTestResult }) {
  if (!result || result.durationTestPass == null) return <Badge color="slate">Pending</Badge>;
  if (result.overallResult === "PASS") return <Badge color="green">Pass</Badge>;
  if (result.overallResult === "FAIL") return <Badge color="red">Fail</Badge>;
  return <Badge color="amber">Needs repair</Badge>;
}

function FittingTestForm({
  jobId,
  testType,
  fitting,
  result,
  onDone,
}: {
  jobId: string;
  testType: TestType | null;
  fitting: Fitting;
  result?: FittingTestResult;
  onDone: () => void;
}) {
  const boundAction = saveFittingTestResultAction.bind(null, jobId, fitting.id);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    boundAction,
    undefined
  );

  return (
    <Card className="p-4 border-brand-200">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">{fitting.reference}</p>
        <span className="text-xs text-slate-400">{fitting.location}</span>
      </div>
      <form
        action={async (formData) => {
          await formAction(formData);
        }}
        className="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <PhotoField
            id="beforePhoto"
            label="Before photo"
            existing={result?.beforePhotoPath}
          />
          <PhotoField
            id="afterPhoto"
            label="After photo"
            existing={result?.afterPhotoPath}
          />
        </div>

        <div className="space-y-2">
          {checklistItemsFor(testType).map((item) => (
            <ChecklistRow
              key={item.key}
              name={item.key}
              label={item.label}
              defaultValue={boolToStr(
                result?.[item.key as keyof FittingTestResult] as boolean | null | undefined
              )}
            />
          ))}
        </div>

        <div>
          <Label htmlFor={`overallResult-${fitting.id}`}>Overall result</Label>
          <Select
            id={`overallResult-${fitting.id}`}
            name="overallResult"
            defaultValue={result?.overallResult ?? "PASS"}
          >
            <option value="PASS">Pass</option>
            <option value="NEEDS_REPAIR">Needs repair</option>
            <option value="FAIL">Fail</option>
          </Select>
        </div>

        <div>
          <Label htmlFor={`comments-${fitting.id}`}>Comments</Label>
          <Textarea
            id={`comments-${fitting.id}`}
            name="comments"
            rows={2}
            defaultValue={result?.comments ?? ""}
          />
        </div>

        <div>
          <Label htmlFor={`repairNotes-${fitting.id}`}>Repair notes (if applicable)</Label>
          <Textarea
            id={`repairNotes-${fitting.id}`}
            name="repairNotes"
            rows={2}
            defaultValue={result?.repairNotes ?? ""}
            placeholder="What needs to be repaired/replaced"
          />
        </div>

        <ErrorText>{state?.error}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save result"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Close
          </Button>
        </div>
      </form>
    </Card>
  );
}

function boolToStr(v: boolean | null | undefined) {
  if (v === true) return "pass";
  if (v === false) return "fail";
  return "";
}

function ChecklistRow({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        <RadioPill
          name={name}
          value="pass"
          defaultChecked={defaultValue === "pass"}
          icon={<CheckIcon className="h-3.5 w-3.5" />}
          activeClass="has-[:checked]:bg-green-100 has-[:checked]:text-green-800"
        />
        <RadioPill
          name={name}
          value="fail"
          defaultChecked={defaultValue === "fail"}
          icon={<XIcon className="h-3.5 w-3.5" />}
          activeClass="has-[:checked]:bg-red-100 has-[:checked]:text-red-800"
        />
      </div>
    </div>
  );
}

function RadioPill({
  name,
  value,
  defaultChecked,
  icon,
  activeClass,
}: {
  name: string;
  value: string;
  defaultChecked: boolean;
  icon: ReactNode;
  activeClass: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-400 has-[:checked]:border-transparent ${activeClass}`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {icon}
    </label>
  );
}

function PhotoField({
  id,
  label,
  existing,
}: {
  id: string;
  label: string;
  existing?: string | null;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {existing && (
        <Image
          src={existing}
          alt=""
          width={200}
          height={120}
          className="mb-2 h-24 w-full rounded-lg object-cover border border-slate-100"
        />
      )}
      <Input id={id} name={id} type="file" accept="image/*" capture="environment" />
    </div>
  );
}
