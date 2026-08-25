-- CreateTable
CREATE TABLE "RcdUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "rcdType" TEXT NOT NULL DEFAULT 'TYPE_A',
    "ratedCurrentMa" INTEGER NOT NULL DEFAULT 30,
    "photoPath" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RcdUnit_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RcdTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "rcdUnitId" TEXT NOT NULL,
    "beforePhotoPath" TEXT,
    "afterPhotoPath" TEXT,
    "testButtonPass" BOOLEAN,
    "tripTimeRatedMs" INTEGER,
    "tripTime5xMs" INTEGER,
    "overallResult" TEXT NOT NULL DEFAULT 'PASS',
    "comments" TEXT,
    "repairNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RcdTestResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RcdTestResult_rcdUnitId_fkey" FOREIGN KEY ("rcdUnitId") REFERENCES "RcdUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "accentColor" TEXT NOT NULL DEFAULT '#1d4ed8',
    "showStatCards" BOOLEAN NOT NULL DEFAULT true,
    "showPhotos" BOOLEAN NOT NULL DEFAULT true,
    "tableColumns" JSONB NOT NULL,
    "headerText" TEXT,
    "footerText" TEXT,
    "disclaimerText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "CustomerReportTemplate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerReportTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("businessId", "completedDate", "createdAt", "id", "notes", "scheduledDate", "siteId", "status", "technicianId", "testType") SELECT "businessId", "completedDate", "createdAt", "id", "notes", "scheduledDate", "siteId", "status", "technicianId", "testType" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_businessId_idx" ON "Job"("businessId");
CREATE INDEX "Job_siteId_idx" ON "Job"("siteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RcdUnit_siteId_idx" ON "RcdUnit"("siteId");

-- CreateIndex
CREATE INDEX "RcdTestResult_jobId_idx" ON "RcdTestResult"("jobId");

-- CreateIndex
CREATE INDEX "RcdTestResult_rcdUnitId_idx" ON "RcdTestResult"("rcdUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "RcdTestResult_jobId_rcdUnitId_key" ON "RcdTestResult"("jobId", "rcdUnitId");

-- CreateIndex
CREATE INDEX "ReportTemplate_businessId_idx" ON "ReportTemplate"("businessId");

-- CreateIndex
CREATE INDEX "ReportTemplate_businessId_toolType_idx" ON "ReportTemplate"("businessId", "toolType");

-- CreateIndex
CREATE INDEX "CustomerReportTemplate_templateId_idx" ON "CustomerReportTemplate"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReportTemplate_customerId_toolType_key" ON "CustomerReportTemplate"("customerId", "toolType");
