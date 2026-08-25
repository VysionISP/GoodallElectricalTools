"use client";

import Image from "next/image";
import type { Fitting, FittingType } from "@/generated/prisma/client";
import { CameraIcon, CheckIcon, XIcon } from "@/components/icons";

const TYPE_LABELS: Record<FittingType, string> = {
  EXIT_SIGN: "Exit sign",
  EMERGENCY_LIGHT: "Emergency light",
  COMBINED: "Combined exit/EL",
};

/** Full-size photo + fitting details, with the same pass/fail actions as
 * the list row so a technician can zoom in to confirm location before
 * ticking it off. */
export function FittingPhotoModal({
  fitting,
  status,
  passLabel,
  failLabel,
  onPass,
  onFail,
  onClose,
}: {
  fitting: Fitting;
  status: "pass" | "fail" | "pending";
  passLabel: string;
  failLabel: string;
  onPass: () => void;
  onFail: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {fitting.photoPath ? (
          <Image
            src={fitting.photoPath}
            alt=""
            width={400}
            height={300}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-slate-100 text-slate-300">
            <CameraIcon className="h-10 w-10" />
          </div>
        )}
        <div className="p-4">
          <p className="text-base font-semibold text-slate-900">{fitting.reference}</p>
          <p className="text-sm text-slate-500">{fitting.location}</p>
          <p className="mt-0.5 text-xs text-slate-400">{TYPE_LABELS[fitting.fittingType]}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={onFail}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 font-medium transition-colors ${
                status === "fail"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 text-slate-500 hover:border-red-300"
              }`}
            >
              <XIcon className="h-6 w-6" />
              {failLabel}
            </button>
            <button
              onClick={onPass}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 font-medium transition-colors ${
                status === "pass"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 text-slate-500 hover:border-green-300"
              }`}
            >
              <CheckIcon className="h-6 w-6" />
              {passLabel}
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
