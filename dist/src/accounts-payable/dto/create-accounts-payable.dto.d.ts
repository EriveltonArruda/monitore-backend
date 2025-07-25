export declare class CreateAccountsPayableDto {
    name: string;
    category: string;
    value: number;
    dueDate: Date;
    status?: string;
    installmentType?: string;
    installments?: number | null;
    currentInstallment?: number | null;
    isRecurring?: boolean;
    recurringUntil?: Date;
}
