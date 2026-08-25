"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Fitting, FittingModel, FittingType } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";
import {
  deleteFittingAction,
  setFittingActiveAction,
  updateFittingAction,
} from "@/lib/actions/fittings";
import { Badge, Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";
import { CameraIcon, DownloadIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<FittingType, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined exit/EL",
};

type FittingWithModel = Fitting & { model: FittingModel | null };

export function FittingsManager({
  siteId,
  fittings,
}: {
  siteId: string;
  fittings: FittingWithModel[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const active = fittings.filter((f) => f.active);
  const inactive = fittings.filter((f) => !f.active);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Fittings <span className="text-slate-400 font-normal">({active.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <a
            href={`/api/sites/${siteId}/fittings/export`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <DownloadIcon className="h-4 w-4" />
            CSV
          </a>
          <a
            href={`/api/sites/${siteId}/fittings/report`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <DownloadIcon className="h-4 w-4" />
            PDF register
          </a>
          <Link href={`/sites/${siteId}/devices/new`}>
            <Button variant="secondary">
              <PlusIcon className="h-4 w-4" />
              Add fitting
            </Button>
          </Link>
        </div>
      </div>

      {active.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No fittings recorded yet. Add each exit sign / emergency light so it can be tracked across
          every test visit.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map((f) =>
            editingId === f.id ? (
              <FittingForm
                key={f.id}
                fitting={f}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <FittingCard
                key={f.id}
                fitting={f}
                onEdit={() => setEditingId(f.id)}
              />
            )
          )}
        </div>
      )}

      {inactive.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-xs font-medium text-slate-400">
            {inactive.length} decommissioned fitting{inactive.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {inactive.map((f) => (
              <FittingCard key={f.id} fitting={f} decommissioned />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function FittingCard({
  fitting,
  onEdit,
  decommissioned,
}: {
  fitting: FittingWithModel;
  onEdit?: () => void;
  decommissioned?: boolean;
}) {
  return (
    <Card className="p-3 flex gap-3">
      {fitting.photoPath ? (
        <Image
          src={fitting.photoPath}
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
          <p className="truncate text-sm font-semibold text-slate-900">{fitting.reference}</p>
          <Badge color="blue">{TYPE_LABELS[fitting.fittingType]}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{fitting.location}</p>
        {fitting.model && (
          <p className="mt-0.5 text-xs text-slate-400">
            {fitting.model.brand} {fitting.model.model}
          </p>
        )}
        {fitting.installedDate && (
          <p className="mt-0.5 text-xs text-slate-400">Installed {formatDate(fitting.installedDate)}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {!decommissioned && onEdit && (
            <button onClick={onEdit} className="text-xs font-medium text-brand-700 hover:underline">
              Edit
            </button>
          )}
          {!decommissioned ? (
            <button
              onClick={() => setFittingActiveAction(fitting.id, false)}
              className="text-xs font-medium text-slate-400 hover:text-red-600"
            >
              Decommission
            </button>
          ) : (
            <button
              onClick={() => setFittingActiveAction(fitting.id, true)}
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Delete fitting ${fitting.reference}? This removes its full test history.`)) {
                deleteFittingAction(fitting.id);
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

function FittingForm({
  fitting,
  onDone,
}: {
  fitting: FittingWithModel;
  onDone: () => void;
}) {
  const boundAction = updateFittingAction.bind(null, fitting.id);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    boundAction,
    undefined
  );

  return (
    <Card className="p-4 sm:col-span-2">
      <form
        action={async (formData) => {
          await formAction(formData);
          onDone();
        }}
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="reference">Reference / ID</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="e.g. EL-01"
              defaultValue={fitting.reference}
              required
            />
          </div>
          <div>
            <Label htmlFor="fittingType">Type</Label>
            <Select id="fittingType" name="fittingType" defaultValue={fitting.fittingType}>
              <option value="EXIT_SIGN">Exit sign</option>
              <option value="EMERGENCY_LIGHT">Emergency light</option>
              <option value="COMBINED">Combined exit/EL</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location description</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Level 1 corridor near stairwell"
            defaultValue={fitting.location}
            required
          />
        </div>
        <div>
          <Label htmlFor="installedDate">Installed date (if known)</Label>
          <Input
            id="installedDate"
            name="installedDate"
            type="date"
            defaultValue={fitting.installedDate ? fitting.installedDate.toISOString().slice(0, 10) : ""}
          />
        </div>
        <div>
          <Label htmlFor="photo">Reference photo {fitting.photoPath ? "(replace existing)" : ""}</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" capture="environment" />
        </div>
        <ErrorText>{state?.error}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save fitting"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
