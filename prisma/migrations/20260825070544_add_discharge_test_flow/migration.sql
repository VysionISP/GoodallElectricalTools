-- AlterTable
ALTER TABLE "FittingTestResult" ADD COLUMN "energisedPass" BOOLEAN;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "technicianId" TEXT,
    "toolType" TEXT NOT NULL DEFAULT 'EXIT_EMERGENCY_LIGHTING',
    "testType" TEXT,
    "rcdTestFrequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" DATETIME,
    "completedDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargePhase" TEXT NOT NULL DEFAULT 'ENERGISED_CHECK',
    "dischargeRunningSince" DATETIME,
    "dischargeElapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("businessId", "completedDate", "createdAt", "id", "notes", "rcdTestFrequency", "scheduledDate", "siteId", "status", "technicianId", "testType", "toolType") SELECT "businessId", "completedDate", "createdAt", "id", "notes", "rcdTestFrequency", "scheduledDate", "siteId", "status", "technicianId", "testType", "toolType" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_businessId_idx" ON "Job"("businessId");
CREATE INDEX "Job_siteId_idx" ON "Job"("siteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
