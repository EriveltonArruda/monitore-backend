-- CreateTable
CREATE TABLE "Municipality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "municipalityId" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "municipalityId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "monthlyValue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "signedAt" TIMESTAMP(3),
    "processNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receivable" (
    "id" SERIAL NOT NULL,
    "noteNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "grossAmount" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION,
    "periodLabel" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'A_RECEBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractId" INTEGER NOT NULL,

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_name_key" ON "Municipality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_cnpj_key" ON "Municipality"("cnpj");

-- CreateIndex
CREATE INDEX "Department_municipalityId_idx" ON "Department"("municipalityId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_municipalityId_name_key" ON "Department"("municipalityId", "name");

-- CreateIndex
CREATE INDEX "Contract_municipalityId_idx" ON "Contract"("municipalityId");

-- CreateIndex
CREATE INDEX "Contract_departmentId_idx" ON "Contract"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_municipalityId_code_key" ON "Contract"("municipalityId", "code");

-- CreateIndex
CREATE INDEX "Receivable_contractId_idx" ON "Receivable"("contractId");

-- CreateIndex
CREATE INDEX "Receivable_issueDate_idx" ON "Receivable"("issueDate");

-- CreateIndex
CREATE INDEX "Receivable_status_idx" ON "Receivable"("status");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
