-- CreateTable
CREATE TABLE "TravelAdvance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "travelExpenseId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TravelAdvance_travelExpenseId_fkey" FOREIGN KEY ("travelExpenseId") REFERENCES "TravelExpense" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TravelReturn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "travelExpenseId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "returnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TravelReturn_travelExpenseId_fkey" FOREIGN KEY ("travelExpenseId") REFERENCES "TravelExpense" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TravelAdvance_travelExpenseId_idx" ON "TravelAdvance"("travelExpenseId");

-- CreateIndex
CREATE INDEX "TravelReturn_travelExpenseId_idx" ON "TravelReturn"("travelExpenseId");
