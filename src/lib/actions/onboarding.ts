"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile, UPLOAD_ROOT } from "@/lib/upload";
import type { ActionResult } from "@/lib/actions/auth";

/** Step 1 of onboarding: business contact details. */
export async function saveOnboardingContactAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Business name is required." };

  await prisma.business.update({
    where: { id: session.user.businessId },
    data: {
      name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
    },
  });
}

/** Step 2 of onboarding: compliance details & logo (all optional). */
export async function saveOnboardingComplianceAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const businessId = session.user.businessId;

  let logoPath: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      logoPath = await saveUploadedFile(logo, businessId, "logos", "image");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not upload logo." };
    }
    const existing = await prisma.business.findUnique({ where: { id: businessId } });
    await deleteUploadedFile(businessId, existing?.logoPath);
  }

  await prisma.business.update({
    where: { id: businessId },
    data: {
      recNumber: String(formData.get("recNumber") ?? "").trim() || null,
      abn: String(formData.get("abn") ?? "").trim() || null,
      ...(logoPath ? { logoPath } : {}),
    },
  });
}

/** Final onboarding step: mark done and either jump to creating the first
 * real customer, load the demo dataset, or just head to the dashboard. */
export async function finishOnboardingAction(choice: "customer" | "demo" | "skip") {
  const session = await requireSession();
  const businessId = session.user.businessId;

  if (choice === "demo") {
    await seedDemoData(businessId);
  }

  await prisma.business.update({
    where: { id: businessId },
    data: { onboardedAt: new Date(), ...(choice === "demo" ? { demoData: true } : {}) },
  });

  revalidatePath("/", "layout");
  redirect(choice === "customer" ? "/customers/new" : "/");
}

/** Wipes the demo dataset: demo customers cascade to their sites, fittings,
 * RCD units, jobs and results; generated demo photos are removed from disk. */
export async function clearDemoDataAction() {
  const session = await requireSession();
  const businessId = session.user.businessId;

  const demoCustomers = await prisma.customer.findMany({
    where: { businessId, isDemo: true },
    include: {
      sites: {
        include: {
          fittings: true,
          jobs: { include: { fittingTestResults: true, rcdTestResults: true } },
        },
      },
    },
  });

  // Collect generated photo files before the cascade removes the rows.
  const photoPaths: (string | null)[] = [];
  for (const customer of demoCustomers) {
    for (const site of customer.sites) {
      for (const fitting of site.fittings) photoPaths.push(fitting.photoPath);
      for (const job of site.jobs) {
        for (const r of job.fittingTestResults) photoPaths.push(r.beforePhotoPath, r.afterPhotoPath);
        for (const r of job.rcdTestResults) photoPaths.push(r.beforePhotoPath, r.afterPhotoPath);
      }
    }
  }

  await prisma.customer.deleteMany({ where: { businessId, isDemo: true } });
  for (const p of photoPaths) await deleteUploadedFile(businessId, p);

  await prisma.business.update({ where: { id: businessId }, data: { demoData: false } });
  revalidatePath("/", "layout");
}

/** Generates a labelled placeholder JPEG on disk (no bundled image assets
 * needed) and returns its served URL path. */
async function makeDemoPhoto(businessId: string, label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">
    <rect width="320" height="240" fill="${color}"/>
    <text x="160" y="120" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="bold"
      fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="160" y="215" font-family="Helvetica, Arial, sans-serif" font-size="13"
      fill="rgba(255,255,255,0.75)" text-anchor="middle">demo photo</text>
  </svg>`;
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();

  const dir = path.join(UPLOAD_ROOT, businessId, "fittings");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.jpg`;
  await writeFile(path.join(dir, filename), buffer);
  return `/api/uploads/${businessId}/fittings/${filename}`;
}

async function seedDemoData(businessId: string) {
  // Idempotent: don't stack a second demo set if one is already loaded.
  const existing = await prisma.customer.findFirst({ where: { businessId, isDemo: true } });
  if (existing) return;

  const sharedModels = await prisma.fittingModel.findMany({ where: { businessId: null } });
  const modelFor = (type: "EXIT_SIGN" | "EMERGENCY_LIGHT" | "COMBINED") =>
    sharedModels.find((m) => m.fittingType === type)?.id ?? null;

  const customer = await prisma.customer.create({
    data: {
      businessId,
      isDemo: true,
      name: "Acme Property Group (demo)",
      contactName: "Sam Facilities",
      contactEmail: "sam@example.com",
      contactPhone: "0400 000 000",
      notes: "Demo customer created during onboarding — safe to clear at any time.",
    },
  });

  const site = await prisma.site.create({
    data: {
      businessId,
      customerId: customer.id,
      name: "Riverside Office (demo)",
      address: "1 Example Street, Melbourne VIC",
      autoNaming: true,
    },
  });

  const fittingSpecs = [
    { reference: "EX-01", type: "EXIT_SIGN" as const, location: "Front entry, above door", color: "#047857" },
    { reference: "EX-02", type: "EXIT_SIGN" as const, location: "Rear fire exit", color: "#0f766e" },
    { reference: "EL-01", type: "EMERGENCY_LIGHT" as const, location: "Level 1 corridor", color: "#1d4ed8" },
    { reference: "EL-02", type: "EMERGENCY_LIGHT" as const, location: "Stairwell, mid landing", color: "#7c3aed" },
    { reference: "CB-01", type: "COMBINED" as const, location: "Warehouse roller door", color: "#b45309" },
  ];

  const fittings = [];
  for (const spec of fittingSpecs) {
    fittings.push(
      await prisma.fitting.create({
        data: {
          siteId: site.id,
          reference: spec.reference,
          location: spec.location,
          fittingType: spec.type,
          modelId: modelFor(spec.type),
          installedDate: new Date("2022-03-15"),
          photoPath: await makeDemoPhoto(businessId, spec.reference, spec.color),
        },
      })
    );
  }

  // A completed 6-monthly discharge test: EL-02 failed its 90-minute
  // discharge, everything else passed — so the report shows a realistic
  // "works required" section.
  const exitJob = await prisma.job.create({
    data: {
      businessId,
      siteId: site.id,
      toolType: "EXIT_EMERGENCY_LIGHTING",
      testType: "SIX_MONTHLY_DISCHARGE",
      status: "COMPLETED",
      dischargePhase: "DONE",
      completedDate: new Date(),
      notes: "Demo test visit",
    },
  });

  for (const fitting of fittings) {
    const failed = fitting.reference === "EL-02";
    await prisma.fittingTestResult.create({
      data: {
        jobId: exitJob.id,
        fittingId: fitting.id,
        energisedPass: true,
        durationTestPass: !failed,
        illuminationPass: !failed,
        batteryConditionPass: !failed,
        lampConditionPass: true,
        physicalDamagePass: true,
        signageVisiblePass: true,
        overallResult: failed ? "FAIL" : "PASS",
        comments: failed ? "Dropped out after 35 minutes." : null,
        repairNotes: failed ? "Battery at end of life — replace fitting." : null,
      },
    });
  }

  // A couple of RCDs and a completed RCD test so the second tool has data too.
  const rcd1 = await prisma.rcdUnit.create({
    data: {
      siteId: site.id,
      reference: "SB1-RCD1",
      location: "Main switchboard, power circuit",
      rcdType: "TYPE_A",
      ratedCurrentMa: 30,
    },
  });
  const rcd2 = await prisma.rcdUnit.create({
    data: {
      siteId: site.id,
      reference: "SB1-RCD2",
      location: "Main switchboard, lighting circuit",
      rcdType: "TYPE_A",
      ratedCurrentMa: 30,
    },
  });

  const rcdJob = await prisma.job.create({
    data: {
      businessId,
      siteId: site.id,
      toolType: "RCD_TESTING",
      rcdTestFrequency: "SIX_MONTHLY",
      status: "COMPLETED",
      completedDate: new Date(),
      notes: "Demo RCD test visit",
    },
  });

  await prisma.rcdTestResult.create({
    data: {
      jobId: rcdJob.id,
      rcdUnitId: rcd1.id,
      testButtonPass: true,
      tripTimeRatedMs: 24,
      tripTime5xMs: 17,
      overallResult: "PASS",
    },
  });
  await prisma.rcdTestResult.create({
    data: {
      jobId: rcdJob.id,
      rcdUnitId: rcd2.id,
      testButtonPass: false,
      tripTimeRatedMs: 320,
      tripTime5xMs: 210,
      overallResult: "FAIL",
      repairNotes: "Trip time outside limits — replace RCD.",
    },
  });
}
