-- CreateIndex
CREATE INDEX "AccountPayable_dueDate_idx" ON "AccountPayable"("dueDate");

-- CreateIndex
CREATE INDEX "AccountPayable_status_dueDate_idx" ON "AccountPayable"("status", "dueDate");

-- CreateIndex
CREATE INDEX "AccountPayable_category_dueDate_idx" ON "AccountPayable"("category", "dueDate");

-- CreateIndex
CREATE INDEX "Payment_accountId_idx" ON "Payment"("accountId");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE INDEX "Payment_accountId_paidAt_amount_idx" ON "Payment"("accountId", "paidAt", "amount");
