-- CreateTable
CREATE TABLE "CategoryCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "rankedTools" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryCache_categoryId_key" ON "CategoryCache"("categoryId");
