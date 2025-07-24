-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountPayable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A_PAGAR',
    "installmentType" TEXT NOT NULL DEFAULT 'UNICA',
    "installments" INTEGER,
    "currentInstallment" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringUntil" DATETIME,
    "recurringSourceId" INTEGER,
    CONSTRAINT "AccountPayable_recurringSourceId_fkey" FOREIGN KEY ("recurringSourceId") REFERENCES "AccountPayable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AccountPayable" ("category", "createdAt", "currentInstallment", "dueDate", "id", "installmentType", "installments", "name", "status", "updatedAt", "value") SELECT "category", "createdAt", "currentInstallment", "dueDate", "id", "installmentType", "installments", "name", "status", "updatedAt", "value" FROM "AccountPayable";
DROP TABLE "AccountPayable";
ALTER TABLE "new_AccountPayable" RENAME TO "AccountPayable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
