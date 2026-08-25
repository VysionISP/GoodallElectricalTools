"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { RcdUnit, RcdType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import {
  createRcdUnitAction,
  deleteRcdUnitAction,
  setRcdUnitActiveAction,
  updateRcdUnitAction,
} from "@/lib/actions/rcd-units";
import { Badge, Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";
import { CameraIcon, DownloadIcon, PlusIcon, TrashIcon } from "@/components/icons";

const TYPE_LABELS: Record<RcdType, string> = {
  TYPE_AC: "Type AC",
  TYPE_A: "Type A",
  TYPE_B: "Type B",
};

export function RcdUnitsManager({ siteId, rcdUnits }: { siteId: string; rcdUnits: RcdUnit[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const active = rcdUnits.filter((u) => u.active);
  const inactive = rcdUnits.filter((u) => !u.active);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          RCDs / safety switches <span className="text-slate-400 font-normal">({active.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <a
            href={`/api/sites/${siteId}/rcd-units/export`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <DownloadIcon className="h-4 w-4" />
            CSV
          </a>
          <a
            href={`/api/sites/${siteId}/rcd-units/report`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <DownloadIcon className="h-4 w-4" />
            PDF register
          </a>
          <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
            <PlusIcon className="h-4 w-4" />
            {adding ? "Cancel" : "Add RCD"}
          </Button>
        </div>
      </div>

      {adding && (
        <div className="mb-4">
          <RcdUnitForm siteId={siteId} onDone={() => setAdding(false)} />
        </div>
      )}

      {active.length === 0 && !adding ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No RCDs recorded yet. Add each safety switch / RCD so it can be tracked across every test
          visit.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map((u) =>
            editingId === u.id ? (
              <RcdUnitForm key={u.id} siteId={siteId} rcdUnit={u} onDone={() => setEditingId(null)} />
            ) : (
              <RcdUnitCard key={u.id} rcdUnit={u} onEdit={() => setEditingId(u.id)} />
            )
          )}
        </div>
      )}

      {inactive.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-xs font-medium text-slate-400">
            {inactive.length} decommissioned RCD{inactive.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {inactive.map((u) => (
              <RcdUnitCard key={u.id} rcdUnit={u} decommissioned />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function RcdUnitCard({
  rcdUnit,
  onEdit,
  decommissioned,
}: {
  rcdUnit: RcdUnit;
  onEdit?: () => void;
  decommissioned?: boolean;
}) {
  return (
    <Card className="p-3 flex gap-3">
      {rcdUnit.photoPath ? (
        <Image
          src={rcdUnit.photoPath}
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-lg object-cover border border-slate-100 shrink-0"
        />
      ) : (
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-300">
          <CameraIcon className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{rcdUnit.reference}</p>
          <Badge color="blue">
            {TYPE_LABELS[rcdUnit.rcdType]} · {rcdUnit.ratedCurrentMa}mA
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{rcdUnit.location}</p>
        <div className="mt-2 flex items-center gap-3">
          {!decommissioned && onEdit && (
            <button onClick={onEdit} className="text-xs font-medium text-brand-700 hover:underline">
              Edit
            </button>
          )}
          {!decommissioned ? (
            <button
              onClick={() => setRcdUnitActiveAction(rcdUnit.id, false)}
              className="text-xs font-medium text-slate-400 hover:text-red-600"
            >
              Decommission
            </button>
          ) : (
            <button
              onClick={() => setRcdUnitActiveAction(rcdUnit.id, true)}
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Delete RCD ${rcdUnit.reference}? This removes its full test history.`)) {
                deleteRcdUnitAction(rcdUnit.id);
              }
            }}
            className="text-xs font-medium text-slate-400 hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function RcdUnitForm({
  siteId,
  rcdUnit,
  onDone,
}: {
  siteId: string;
  rcdUnit?: RcdUnit;
  onDone: () => void;
}) {
  const boundAction = rcdUnit
    ? updateRcdUnitAction.bind(null, rcdUnit.id)
    : createRcdUnitAction.bind(null, siteId);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(boundAction, undefined);

  return (
    <Card className="p-4 sm:col-span-2">
      <form
        action={async (formData) => {
          await formAction(formData);
          onDone();
        }}
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="reference">Reference / ID</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="e.g. SB1-RCD2"
              defaultValue={rcdUnit?.reference}
              required
            />
          </div>
          <div>
            <Label htmlFor="rcdType">Type</Label>
            <Select id="rcdType" name="rcdType" defaultValue={rcdUnit?.rcdType ?? "TYPE_A"}>
              <option value="TYPE_AC">Type AC</option>
              <option value="TYPE_A">Type A</option>
              <option value="TYPE_B">Type B</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="ratedCurrentMa">Rated current (mA)</Label>
            <Input
              id="ratedCurrentMa"
              name="ratedCurrentMa"
              type="number"
              min={1}
              step={1}
              defaultValue={rcdUnit?.ratedCurrentMa ?? 30}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location description</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Main switchboard, kitchen circuit"
            defaultValue={rcdUnit?.location}
            required
          />
        </div>
        <div>
          <Label htmlFor="photo">Reference photo {rcdUnit?.photoPath ? "(replace existing)" : ""}</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" capture="environment" />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : rcdUnit ? "Save RCD" : "Add RCD"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
