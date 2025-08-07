/*
  Warnings:

  - You are about to drop the column `salePrice` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "stockQuantity" INTEGER NOT NULL,
    "minStockQuantity" INTEGER NOT NULL DEFAULT 0,
    "costPrice" REAL,
    "location" TEXT,
    "mainImageUrl" TEXT,
    "videoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" INTEGER,
    "supplierId" INTEGER,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "costPrice", "createdAt", "description", "id", "location", "mainImageUrl", "minStockQuantity", "name", "sku", "status", "stockQuantity", "supplierId", "unit", "updatedAt", "videoUrl") SELECT "categoryId", "costPrice", "createdAt", "description", "id", "location", "mainImageUrl", "minStockQuantity", "name", "sku", "status", "stockQuantity", "supplierId", "unit", "updatedAt", "videoUrl" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
