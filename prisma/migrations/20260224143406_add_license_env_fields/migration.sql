-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "logoEmoji" TEXT NOT NULL DEFAULT '🤖',
    "websiteUrl" TEXT,
    "description" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "automationTags" TEXT NOT NULL,
    "freePlanAvailable" BOOLEAN NOT NULL DEFAULT false,
    "freePlanDescription" TEXT,
    "setupCost" TEXT NOT NULL,
    "monthlyPricePerUser" INTEGER,
    "monthlyPriceFlat" INTEGER,
    "monthlyPriceLabel" TEXT NOT NULL,
    "enterpriseNote" TEXT,
    "difficultyScore" INTEGER NOT NULL,
    "maintenanceScore" INTEGER NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "costReductionPct" INTEGER,
    "timeReductionPct" INTEGER,
    "effectDescription" TEXT NOT NULL,
    "effectBaseline" TEXT,
    "selfSetupNote" TEXT,
    "fullDelegationNote" TEXT,
    "selfMaintenanceNote" TEXT,
    "fullMaintenanceNote" TEXT,
    "selfMaintenanceHoursPerMonth" REAL,
    "fullMaintenanceCostPerMonth" INTEGER,
    "adminUserNote" TEXT,
    "endUserNote" TEXT,
    "endUserRequiresLicense" BOOLEAN NOT NULL DEFAULT false,
    "isIncludedInEnv" TEXT,
    "relatedBaseEnv" TEXT,
    "compatibleEnvs" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tool" ("adminUserNote", "automationTags", "categories", "company", "compatibleEnvs", "costReductionPct", "createdAt", "description", "difficultyScore", "effectBaseline", "effectDescription", "endUserNote", "enterpriseNote", "features", "freePlanAvailable", "freePlanDescription", "fullDelegationNote", "fullMaintenanceCostPerMonth", "fullMaintenanceNote", "id", "lastUpdated", "logoEmoji", "maintenanceScore", "monthlyPriceFlat", "monthlyPriceLabel", "monthlyPricePerUser", "name", "requiredSkills", "selfMaintenanceHoursPerMonth", "selfMaintenanceNote", "selfSetupNote", "setupCost", "timeReductionPct", "updatedAt", "websiteUrl") SELECT "adminUserNote", "automationTags", "categories", "company", "compatibleEnvs", "costReductionPct", "createdAt", "description", "difficultyScore", "effectBaseline", "effectDescription", "endUserNote", "enterpriseNote", "features", "freePlanAvailable", "freePlanDescription", "fullDelegationNote", "fullMaintenanceCostPerMonth", "fullMaintenanceNote", "id", "lastUpdated", "logoEmoji", "maintenanceScore", "monthlyPriceFlat", "monthlyPriceLabel", "monthlyPricePerUser", "name", "requiredSkills", "selfMaintenanceHoursPerMonth", "selfMaintenanceNote", "selfSetupNote", "setupCost", "timeReductionPct", "updatedAt", "websiteUrl" FROM "Tool";
DROP TABLE "Tool";
ALTER TABLE "new_Tool" RENAME TO "Tool";
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
