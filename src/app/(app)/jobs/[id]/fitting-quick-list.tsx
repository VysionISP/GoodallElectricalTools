"use client";

import { useState } from "react";
import Image from "next/image";
import type { Fitting } from "@/generated/prisma/client";
import { CameraIcon, CheckIcon, XIcon } from "@/components/icons";
import { FittingPhotoModal } from "./fitting-photo-modal";

export type QuickStatus = "pass" | "fail" | "pending";

/** A scrollable list of fittings, each with a big tick/cross for a quick
 * pass/fail decision and a tap-to-enlarge photo. Used for both the
 * energised walkthrough and the live discharge test. */
export function FittingQuickList({
  fittings,
  statusFor,
  passLabel,
  failLabel,
  onPass,
  onFail,
}: {
  fittings: Fitting[];
  statusFor: (fittingId: string) => QuickStatus;
  passLabel: string;
  failLabel: string;
  onPass: (fittingId: string) => void;
  onFail: (fittingId: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openFitting = fittings.find((f) => f.id === openId) ?? null;

  return (
    <div className="space-y-2">
      {fittings.map((fitting) => {
        const status = statusFor(fitting.id);
        return (
          <div
            key={fitting.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <button onClick={() => setOpenId(fitting.id)} className="shrink-0">
              {fitting.photoPath ? (
                <Image
                  src={fitting.photoPath}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg object-cover border border-slate-100"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-300">
                  <CameraIcon className="h-5 w-5" />
                </div>
              )}
            </button>

            <button onClick={() => setOpenId(fitting.id)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-slate-900">{fitting.reference}</p>
              <p className="truncate text-xs text-slate-500">{fitting.location}</p>
            </button>

            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => onFail(fitting.id)}
                aria-label={failLabel}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors ${
                  status === "fail"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-slate-200 text-slate-300 hover:border-red-300 hover:text-red-500"
                }`}
              >
                <XIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onPass(fitting.id)}
                aria-label={passLabel}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors ${
                  status === "pass"
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-slate-200 text-slate-300 hover:border-green-300 hover:text-green-500"
                }`}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}

      {openFitting && (
        <FittingPhotoModal
          fitting={openFitting}
          status={statusFor(openFitting.id)}
          passLabel={passLabel}
          failLabel={failLabel}
          onPass={() => onPass(openFitting.id)}
          onFail={() => onFail(openFitting.id)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
