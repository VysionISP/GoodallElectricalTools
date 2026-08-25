"use client";

import { useState } from "react";
import Image from "next/image";
import type { FittingModel, FittingType } from "@/generated/prisma/client";
import {
  createFittingModelAction,
  deleteFittingModelAction,
  setFittingModelPhotoAction,
} from "@/lib/actions/fitting-models";
import { Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";
import { CameraIcon, PlusIcon, TrashIcon } from "@/components/icons";

const TYPE_LABELS: Record<FittingType, string> = {
  EXIT_SIGN: "Exit signs",
  EMERGENCY_LIGHT: "Emergency lights",
  COMBINED: "Combined exit/EL",
};
const FITTING_TYPES: FittingType[] = ["EXIT_SIGN", "EMERGENCY_LIGHT", "COMBINED"];

type CatalogEntry = FittingModel & { _count: { fittings: number } };

export function CatalogManager({ catalog: initialCatalog }: { catalog: CatalogEntry[] }) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function attachPhoto(entry: CatalogEntry, file: File) {
    setBusyId(entry.id);
    setError(undefined);
    const fd = new FormData();
    fd.set("photo", file);
    const result = await setFittingModelPhotoAction(entry.id, undefined, fd);
    setBusyId(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    const preview = URL.createObjectURL(file);
    setCatalog((c) => c.map((m) => (m.id === entry.id ? { ...m, photoPath: preview } : m)));
  }

  async function remove(entry: CatalogEntry) {
    if (!confirm(`Delete ${entry.brand} ${entry.model} from the shared catalogue?`)) return;
    setBusyId(entry.id);
    setError(undefined);
    const result = await deleteFittingModelAction(entry.id);
    setBusyId(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setCatalog((c) => c.filter((m) => m.id !== entry.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-500">
          Every business picks from this shared catalogue when adding fittings to a site. Attach a
          photo of each product so technicians can visually match the device in front of them.
        </p>
        <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
          <PlusIcon className="h-4 w-4" />
          {adding ? "Cancel" : "Add product"}
        </Button>
      </div>

      {adding && (
        <NewDeviceForm
          onCreated={(entry) => {
            setCatalog((c) => [...c, entry]);
            setAdding(false);
          }}
        />
      )}

      <ErrorText>{error}</ErrorText>

      {FITTING_TYPES.map((type) => {
        const entries = catalog.filter((m) => m.fittingType === type);
        if (entries.length === 0) return null;
        return (
          <section key={type}>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              {TYPE_LABELS[type]}{" "}
              <span className="font-normal text-slate-400">({entries.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <Card key={entry.id} className="flex gap-3 p-3">
                  {entry.photoPath ? (
                    <Image
                      src={entry.photoPath}
                      alt=""
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] shrink-0 rounded-lg border border-slate-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                      <CameraIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{entry.brand}</p>
                    <p className="truncate text-xs text-slate-500">{entry.model}</p>
                    {entry._count.fittings > 0 && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {entry._count.fittings} fitting{entry._count.fittings === 1 ? "" : "s"} in use
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <label className="cursor-pointer text-xs font-medium text-brand-700 hover:underline">
                        {busyId === entry.id
                          ? "Working..."
                          : entry.photoPath
                            ? "Replace photo"
                            : "Add photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busyId === entry.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) attachPhoto(entry, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={busyId === entry.id}
                        onClick={() => remove(entry)}
                        className="text-xs font-medium text-slate-400 hover:text-red-600"
                        aria-label={`Delete ${entry.brand} ${entry.model}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function NewDeviceForm({ onCreated }: { onCreated: (entry: CatalogEntry) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <Card className="p-4">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setPending(true);
          setError(undefined);
          const formData = new FormData(form);
          const result = await createFittingModelAction(formData);
          setPending(false);
          if ("error" in result) {
            setError(result.error);
            return;
          }
          const photo = formData.get("photo");
          onCreated({
            id: result.id,
            businessId: null,
            brand: String(formData.get("brand")),
            model: String(formData.get("model")),
            fittingType: String(formData.get("fittingType")) as FittingType,
            photoPath: photo instanceof File && photo.size > 0 ? URL.createObjectURL(photo) : null,
            createdAt: new Date(),
            _count: { fittings: 0 },
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" placeholder="e.g. Clevertronics" required />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="e.g. Cleverfit PRO Exit" required />
          </div>
          <div>
            <Label htmlFor="fittingType">Type</Label>
            <Select id="fittingType" name="fittingType" defaultValue="EMERGENCY_LIGHT">
              <option value="EXIT_SIGN">Exit sign</option>
              <option value="EMERGENCY_LIGHT">Emergency light</option>
              <option value="COMBINED">Combined exit/EL</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="photo">Product photo</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add to catalogue"}
        </Button>
      </form>
    </Card>
  );
}
