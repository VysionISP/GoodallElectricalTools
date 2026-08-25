-- AlterTable
ALTER TABLE "Site" ADD COLUMN "autoNaming" BOOLEAN;

-- CreateTable
CREATE TABLE "FittingModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fittingType" TEXT NOT NULL,
    "photoPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FittingModel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fitting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "fittingType" TEXT NOT NULL DEFAULT 'EMERGENCY_LIGHT',
    "photoPath" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelId" TEXT,
    "installedDate" DATETIME,
    CONSTRAINT "Fitting_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fitting_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "FittingModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Fitting" ("active", "createdAt", "fittingType", "id", "location", "photoPath", "reference", "siteId") SELECT "active", "createdAt", "fittingType", "id", "location", "photoPath", "reference", "siteId" FROM "Fitting";
DROP TABLE "Fitting";
ALTER TABLE "new_Fitting" RENAME TO "Fitting";
CREATE INDEX "Fitting_siteId_idx" ON "Fitting"("siteId");
CREATE INDEX "Fitting_modelId_idx" ON "Fitting"("modelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FittingModel_businessId_idx" ON "FittingModel"("businessId");

-- CreateIndex
CREATE INDEX "FittingModel_fittingType_idx" ON "FittingModel"("fittingType");
