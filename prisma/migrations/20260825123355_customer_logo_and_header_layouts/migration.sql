-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "logoPath" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "accentColor" TEXT NOT NULL DEFAULT '#0B2D5C',
    "headerLayout" TEXT NOT NULL DEFAULT 'classic',
    "showStatCards" BOOLEAN NOT NULL DEFAULT true,
    "showPhotos" BOOLEAN NOT NULL DEFAULT true,
    "showCustomerLogo" BOOLEAN NOT NULL DEFAULT true,
    "tableColumns" JSONB NOT NULL,
    "headerText" TEXT,
    "footerText" TEXT,
    "disclaimerText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReportTemplate" ("accentColor", "businessId", "createdAt", "disclaimerText", "footerText", "headerText", "id", "isDefault", "name", "showPhotos", "showStatCards", "tableColumns", "toolType", "updatedAt") SELECT "accentColor", "businessId", "createdAt", "disclaimerText", "footerText", "headerText", "id", "isDefault", "name", "showPhotos", "showStatCards", "tableColumns", "toolType", "updatedAt" FROM "ReportTemplate";
DROP TABLE "ReportTemplate";
ALTER TABLE "new_ReportTemplate" RENAME TO "ReportTemplate";
CREATE INDEX "ReportTemplate_businessId_idx" ON "ReportTemplate"("businessId");
CREATE INDEX "ReportTemplate_businessId_toolType_idx" ON "ReportTemplate"("businessId", "toolType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
