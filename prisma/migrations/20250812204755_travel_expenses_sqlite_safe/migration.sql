-- CreateTable
CREATE TABLE "TravelExpense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeName" TEXT,
    "department" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OUTROS',
    "city" TEXT,
    "state" TEXT,
    "expenseDate" DATETIME,
    "currency" TEXT DEFAULT 'BRL',
    "amountCents" INTEGER NOT NULL,
    "reimbursedCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TravelReimbursement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "travelExpenseId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "reimbursedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bankAccount" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TravelReimbursement_travelExpenseId_fkey" FOREIGN KEY ("travelExpenseId") REFERENCES "TravelExpense" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TravelExpense_expenseDate_idx" ON "TravelExpense"("expenseDate");

-- CreateIndex
CREATE INDEX "TravelExpense_status_category_idx" ON "TravelExpense"("status", "category");

-- CreateIndex
CREATE INDEX "TravelExpense_employeeName_idx" ON "TravelExpense"("employeeName");
