-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Contract_endDate_idx" ON "Contract"("endDate");
