-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "recNumber" TEXT,
    "abn" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "onboardedAt" DATETIME,
    "demoData" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Business" ("abn", "address", "createdAt", "email", "id", "logoPath", "name", "phone", "recNumber", "suspended", "updatedAt") SELECT "abn", "address", "createdAt", "email", "id", "logoPath", "name", "phone", "recNumber", "suspended", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("businessId", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "name", "notes") SELECT "businessId", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "name", "notes" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE INDEX "Customer_businessId_idx" ON "Customer"("businessId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Businesses that existed before onboarding shipped have already set
-- themselves up — don't route them through the wizard.
UPDATE "Business" SET "onboardedAt" = "createdAt" WHERE "onboardedAt" IS NULL;
