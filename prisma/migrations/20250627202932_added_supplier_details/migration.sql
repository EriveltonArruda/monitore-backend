/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "email" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_cnpj_key" ON "Supplier"("cnpj");
