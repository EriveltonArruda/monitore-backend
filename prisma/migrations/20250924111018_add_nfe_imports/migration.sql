-- CreateTable
CREATE TABLE "NfeImport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawXmlPath" TEXT NOT NULL,
    "accessKey" TEXT,
    "number" TEXT,
    "series" TEXT,
    "issueDate" TIMESTAMP(3),
    "emitterCnpj" TEXT,
    "emitterName" TEXT,
    "destCnpj" TEXT,
    "destName" TEXT,
    "totalAmount" DOUBLE PRECISION,

    CONSTRAINT "NfeImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfeItem" (
    "id" SERIAL NOT NULL,
    "nfeImportId" INTEGER NOT NULL,
    "productCode" TEXT,
    "description" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,

    CONSTRAINT "NfeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NfeImport_accessKey_key" ON "NfeImport"("accessKey");

-- CreateIndex
CREATE INDEX "NfeImport_issueDate_idx" ON "NfeImport"("issueDate");

-- CreateIndex
CREATE INDEX "NfeImport_emitterCnpj_issueDate_idx" ON "NfeImport"("emitterCnpj", "issueDate");

-- CreateIndex
CREATE INDEX "NfeImport_destCnpj_issueDate_idx" ON "NfeImport"("destCnpj", "issueDate");

-- CreateIndex
CREATE INDEX "NfeItem_nfeImportId_idx" ON "NfeItem"("nfeImportId");

-- AddForeignKey
ALTER TABLE "NfeItem" ADD CONSTRAINT "NfeItem_nfeImportId_fkey" FOREIGN KEY ("nfeImportId") REFERENCES "NfeImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
