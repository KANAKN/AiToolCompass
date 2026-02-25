-- CreateTable
CREATE TABLE "Tool" (
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
    "compatibleEnvs" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UpdateLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "toolsUpdated" INTEGER NOT NULL DEFAULT 0,
    "details" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");
