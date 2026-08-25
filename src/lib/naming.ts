import type { Fitting, FittingType } from "@/generated/prisma/client";

// Distinct prefixes per type, since exit signs and emergency lights are
// conventionally labelled differently on site.
const REFERENCE_PREFIXES: Record<FittingType, string> = {
  EXIT_SIGN: "EX",
  EMERGENCY_LIGHT: "EL",
  COMBINED: "CB",
};

/** Next auto-suggested reference for a new fitting of this type at a site,
 * e.g. "EL-03" if EL-01 and EL-02 already exist. Only considers references
 * matching this type's own prefix pattern, so unrelated/legacy references
 * don't interfere with the sequence. */
export function suggestFittingReference(fittingType: FittingType, existingFittings: Fitting[]): string {
  const prefix = REFERENCE_PREFIXES[fittingType];
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, "i");

  let maxNumber = 0;
  for (const fitting of existingFittings) {
    const match = fitting.reference.match(pattern);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNumber) maxNumber = n;
    }
  }

  return `${prefix}-${String(maxNumber + 1).padStart(2, "0")}`;
}
