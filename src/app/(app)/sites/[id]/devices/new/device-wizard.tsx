"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Fitting, FittingModel, FittingType, Site } from "@/generated/prisma/client";
import { createFittingAction } from "@/lib/actions/fittings";
import { createFittingModelAction } from "@/lib/actions/fitting-models";
import { suggestFittingReference } from "@/lib/naming";
import { Badge, Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";
import { CameraIcon, PlusIcon } from "@/components/icons";

const TYPE_LABELS: Record<FittingType, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined exit/EL",
};
const FITTING_TYPES: FittingType[] = ["EXIT_SIGN", "EMERGENCY_LIGHT", "COMBINED"];

export function DeviceWizard({
  site,
  existingFittings,
  catalog: initialCatalog,
}: {
  site: Site;
  existingFittings: Fitting[];
  catalog: FittingModel[];
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [added, setAdded] = useState<{ reference: string; fittingType: FittingType; label: string }[]>([]);
  const [step, setStep] = useState<"picker" | "details">("picker");
  const [selectedType, setSelectedType] = useState<FittingType>("EMERGENCY_LIGHT");
  const [selectedModel, setSelectedModel] = useState<FittingModel | null>(null);
  const [addingModel, setAddingModel] = useState(false);

  const allFittings = [
    ...existingFittings,
    ...added.map((a) => ({ reference: a.reference, fittingType: a.fittingType }) as Fitting),
  ];

  return (
    <div>
      {added.length > 0 && (
        <Card className="mb-4 p-3">
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">
            Added this visit ({added.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {added.map((a, i) => (
              <Badge key={i} color="green">
                {a.reference} — {a.label}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {step === "picker" ? (
        <PickerStep
          selectedType={selectedType}
          onSelectType={setSelectedType}
          catalog={catalog}
          onPickModel={(model) => {
            setSelectedModel(model);
            setStep("details");
          }}
          onSkipModel={() => {
            setSelectedModel(null);
            setStep("details");
          }}
          addingModel={addingModel}
          onStartAddModel={() => setAddingModel(true)}
          onCancelAddModel={() => setAddingModel(false)}
          onModelCreated={(model) => {
            setCatalog((c) => [...c, model]);
            setAddingModel(false);
            setSelectedModel(model);
            setStep("details");
          }}
        />
      ) : (
        <DetailsStep
          siteId={site.id}
          fittingType={selectedType}
          model={selectedModel}
          suggestedReference={site.autoNaming ? suggestFittingReference(selectedType, allFittings) : ""}
          onBack={() => setStep("picker")}
          onSaved={(reference) => {
            setAdded((a) => [
              ...a,
              {
                reference,
                fittingType: selectedType,
                label: selectedModel ? `${selectedModel.brand} ${selectedModel.model}` : TYPE_LABELS[selectedType],
              },
            ]);
            setSelectedModel(null);
            setStep("picker");
          }}
        />
      )}

      <div className="mt-6 flex justify-end">
        <Link href={`/sites/${site.id}`}>
          <Button variant="secondary">Finish — back to site</Button>
        </Link>
      </div>
    </div>
  );
}

function PickerStep({
  selectedType,
  onSelectType,
  catalog,
  onPickModel,
  onSkipModel,
  addingModel,
  onStartAddModel,
  onCancelAddModel,
  onModelCreated,
}: {
  selectedType: FittingType;
  onSelectType: (t: FittingType) => void;
  catalog: FittingModel[];
  onPickModel: (m: FittingModel) => void;
  onSkipModel: () => void;
  addingModel: boolean;
  onStartAddModel: () => void;
  onCancelAddModel: () => void;
  onModelCreated: (m: FittingModel) => void;
}) {
  const filtered = catalog.filter((m) => m.fittingType === selectedType);

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-slate-900">1. What type of device is this?</h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {FITTING_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelectType(t)}
            className={`rounded-lg border p-3 text-sm font-medium ${
              selectedType === t
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <h2 className="mt-5 text-sm font-semibold text-slate-900">2. Select the brand & model</h2>
      <p className="mt-1 text-xs text-slate-500">
        Match the photo to the physical device so you pick the right one.
      </p>

      {addingModel ? (
        <NewModelForm fittingType={selectedType} onCancel={onCancelAddModel} onCreated={onModelCreated} />
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPickModel(m)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center hover:border-brand-300 hover:bg-brand-50/50"
            >
              {m.photoPath ? (
                <Image
                  src={m.photoPath}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover border border-slate-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-300">
                  <CameraIcon className="h-7 w-7" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{m.brand}</p>
                <p className="text-xs text-slate-500">{m.model}</p>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={onStartAddModel}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-center text-slate-500 hover:border-brand-300 hover:text-brand-700"
          >
            <PlusIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Add new model to catalog</span>
          </button>
        </div>
      )}

      {!addingModel && (
        <button
          type="button"
          onClick={onSkipModel}
          className="mt-3 text-xs font-medium text-slate-500 hover:text-brand-700 hover:underline"
        >
          Skip — I don&apos;t know the model, or it&apos;s not listed
        </button>
      )}
    </Card>
  );
}

function NewModelForm({
  fittingType,
  onCancel,
  onCreated,
}: {
  fittingType: FittingType;
  onCancel: () => void;
  onCreated: (m: FittingModel) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(undefined);
        const formData = new FormData(e.currentTarget);
        formData.set("fittingType", fittingType);
        const result = await createFittingModelAction(formData);
        setPending(false);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        const brand = String(formData.get("brand"));
        const model = String(formData.get("model"));
        const photo = formData.get("photo");
        const photoPath =
          photo instanceof File && photo.size > 0 ? URL.createObjectURL(photo) : null;
        onCreated({
          id: result.id,
          businessId: null,
          brand,
          model,
          fittingType,
          photoPath,
          createdAt: new Date(),
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" required />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" required />
        </div>
      </div>
      <div>
        <Label htmlFor="modelPhoto">Photo of this model (optional)</Label>
        <Input id="modelPhoto" name="photo" type="file" accept="image/*" capture="environment" />
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add to catalog"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DetailsStep({
  siteId,
  fittingType,
  model,
  suggestedReference,
  onBack,
  onSaved,
}: {
  siteId: string;
  fittingType: FittingType;
  model: FittingModel | null;
  suggestedReference: string;
  onBack: () => void;
  onSaved: (reference: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-3">
        {model?.photoPath ? (
          <Image
            src={model.photoPath}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-lg object-cover border border-slate-100"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-300">
            <CameraIcon className="h-6 w-6" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {model ? `${model.brand} ${model.model}` : "No specific model selected"}
          </p>
          <Badge color="blue">{TYPE_LABELS[fittingType]}</Badge>
        </div>
      </div>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(undefined);
          const formData = new FormData(e.currentTarget);
          formData.set("fittingType", fittingType);
          if (model) formData.set("modelId", model.id);
          const result = await createFittingAction(siteId, undefined, formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onSaved(String(formData.get("reference")));
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="reference">Reference / ID</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="e.g. EL-01"
              defaultValue={suggestedReference}
              required
            />
          </div>
          <div>
            <Label htmlFor="installedDate">Installed date (if known)</Label>
            <Input id="installedDate" name="installedDate" type="date" />
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location description</Label>
          <Textarea
            id="location"
            name="location"
            rows={2}
            placeholder="e.g. Level 1 corridor near stairwell"
            required
          />
        </div>
        <div>
          <Label htmlFor="photo">Photo of the installed device</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" capture="environment" />
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save device & add another"}
          </Button>
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </Card>
  );
}
