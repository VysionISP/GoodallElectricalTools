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
    "notifyDaysBefore" INTEGER NOT NULL DEFAULT 14,
    "notifyCustomerOnDue" BOOLEAN NOT NULL DEFAULT false,
    "emailReportOnComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Business" ("abn", "address", "createdAt", "demoData", "email", "id", "logoPath", "name", "onboardedAt", "phone", "recNumber", "suspended", "updatedAt") SELECT "abn", "address", "createdAt", "demoData", "email", "id", "logoPath", "name", "onboardedAt", "phone", "recNumber", "suspended", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
