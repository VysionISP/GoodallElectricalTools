"use client";

import { useActionState, useState, type ReactNode } from "react";
import Image from "next/image";
import type { RcdUnit, RcdTestResult, RcdType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import { saveRcdTestResultAction } from "@/lib/actions/jobs";
import { Badge, Button, Card, ErrorText, Input, Label, Select, Textarea } from "@/components/ui";
import { CameraIcon, CheckIcon, XIcon } from "@/components/icons";

const TYPE_LABELS: Record<RcdType, string> = {
  TYPE_AC: "Type AC",
  TYPE_A: "Type A",
  TYPE_B: "Type B",
};

// AS/NZS 3760 general guidance: an RCD should trip within 300ms at its rated
// residual current, and within 40ms at 5x rated residual current.
const MAX_TRIP_RATED_MS = 300;
const MAX_TRIP_5X_MS = 40;

export function RcdTestChecklist({
  jobId,
  rcdUnits,
  results,
}: {
  jobId: string;
  rcdUnits: RcdUnit[];
  results: RcdTestResult[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const resultByUnit = new Map(results.map((r) => [r.rcdUnitId, r]));

  const tested = rcdUnits.filter((u) => resultByUnit.has(u.id)).length;
  const failCount = results.filter((r) => r.overallResult !== "PASS").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          RCDs tested{" "}
          <span className="text-slate-400 font-normal">
            ({tested}/{rcdUnits.length})
          </span>
        </h2>
        {failCount > 0 && <Badge color="red">{failCount} need attention</Badge>}
      </div>

      {rcdUnits.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          This site has no RCDs recorded yet. Add RCDs from the site page first.
        </Card>
      ) : (
        <div className="space-y-3">
          {rcdUnits.map((u) =>
            openId === u.id ? (
              <RcdTestForm
                key={u.id}
                jobId={jobId}
                rcdUnit={u}
                result={resultByUnit.get(u.id)}
                onDone={() => setOpenId(null)}
              />
            ) : (
              <RcdRow
                key={u.id}
                rcdUnit={u}
                result={resultByUnit.get(u.id)}
                onOpen={() => setOpenId(u.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function RcdRow({
  rcdUnit,
  result,
  onOpen,
}: {
  rcdUnit: RcdUnit;
  result?: RcdTestResult;
  onOpen: () => void;
}) {
  return (
    <Card className="flex cursor-pointer items-center gap-3 p-3 hover:border-brand-300" onClick={onOpen}>
      {rcdUnit.photoPath ? (
        <Image
          src={rcdUnit.photoPath}
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
          <p className="truncate text-sm font-semibold text-slate-900">{rcdUnit.reference}</p>
          <span className="text-xs text-slate-400">
            {TYPE_LABELS[rcdUnit.rcdType]} · {rcdUnit.ratedCurrentMa}mA
          </span>
        </div>
        <p className="truncate text-xs text-slate-500">{rcdUnit.location}</p>
      </div>
      {result ? (
        <div className="flex shrink-0 items-center gap-3 text-right">
          {result.tripTimeRatedMs != null && (
            <div>
              <p className="text-sm font-semibold text-slate-900">{result.tripTimeRatedMs}ms</p>
              <p className="text-[10px] text-slate-400">trip @ 1x</p>
            </div>
          )}
          <ResultBadge result={result} />
        </div>
      ) : (
        <Badge color="slate">Pending</Badge>
      )}
    </Card>
  );
}

function ResultBadge({ result }: { result?: RcdTestResult }) {
  if (!result) return <Badge color="slate">Pending</Badge>;
  if (result.overallResult === "PASS") return <Badge color="green">Pass</Badge>;
  if (result.overallResult === "FAIL") return <Badge color="red">Fail</Badge>;
  return <Badge color="amber">Needs repair</Badge>;
}

function RcdTestForm({
  jobId,
  rcdUnit,
  result,
  onDone,
}: {
  jobId: string;
  rcdUnit: RcdUnit;
  result?: RcdTestResult;
  onDone: () => void;
}) {
  const boundAction = saveRcdTestResultAction.bind(null, jobId, rcdUnit.id);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(boundAction, undefined);

  return (
    <Card className="p-4 border-brand-200">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">{rcdUnit.reference}</p>
        <span className="text-xs text-slate-400">
          {rcdUnit.location} · {TYPE_LABELS[rcdUnit.rcdType]} · {rcdUnit.ratedCurrentMa}mA
        </span>
      </div>
      <form
        action={async (formData) => {
          await formAction(formData);
        }}
        className="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <PhotoField id="beforePhoto" label="Before photo" existing={result?.beforePhotoPath} />
          <PhotoField id="afterPhoto" label="After photo" existing={result?.afterPhotoPath} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`tripTimeRatedMs-${rcdUnit.id}`}>
              Trip time @ 1x rated (ms) — max {MAX_TRIP_RATED_MS}ms
            </Label>
            <Input
              id={`tripTimeRatedMs-${rcdUnit.id}`}
              name="tripTimeRatedMs"
              type="number"
              min={0}
              step={1}
              defaultValue={result?.tripTimeRatedMs ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={`tripTime5xMs-${rcdUnit.id}`}>
              Trip time @ 5x rated (ms) — max {MAX_TRIP_5X_MS}ms
            </Label>
            <Input
              id={`tripTime5xMs-${rcdUnit.id}`}
              name="tripTime5xMs"
              type="number"
              min={0}
              step={1}
              defaultValue={result?.tripTime5xMs ?? ""}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <span className="text-sm text-slate-700">Push-button (T) test trips the RCD</span>
          <div className="flex gap-1" role="radiogroup" aria-label="Push-button test">
            <RadioPill
              name="testButtonPass"
              value="pass"
              defaultChecked={boolToStr(result?.testButtonPass) === "pass"}
              icon={<CheckIcon className="h-3.5 w-3.5" />}
              activeClass="has-[:checked]:bg-green-100 has-[:checked]:text-green-800"
            />
            <RadioPill
              name="testButtonPass"
              value="fail"
              defaultChecked={boolToStr(result?.testButtonPass) === "fail"}
              icon={<XIcon className="h-3.5 w-3.5" />}
              activeClass="has-[:checked]:bg-red-100 has-[:checked]:text-red-800"
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`overallResult-${rcdUnit.id}`}>Overall result</Label>
          <Select
            id={`overallResult-${rcdUnit.id}`}
            name="overallResult"
            defaultValue={result?.overallResult ?? "PASS"}
          >
            <option value="PASS">Pass</option>
            <option value="NEEDS_REPAIR">Needs repair</option>
            <option value="FAIL">Fail</option>
          </Select>
        </div>

        <div>
          <Label htmlFor={`comments-${rcdUnit.id}`}>Comments</Label>
          <Textarea
            id={`comments-${rcdUnit.id}`}
            name="comments"
            rows={2}
            defaultValue={result?.comments ?? ""}
          />
        </div>

        <div>
          <Label htmlFor={`repairNotes-${rcdUnit.id}`}>Repair notes (if applicable)</Label>
          <Textarea
            id={`repairNotes-${rcdUnit.id}`}
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
      <input id={id} type="radio" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
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
