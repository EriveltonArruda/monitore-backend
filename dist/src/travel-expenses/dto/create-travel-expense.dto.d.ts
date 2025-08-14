declare const CATEGORIES: readonly ["TRANSPORTE", "HOSPEDAGEM", "ALIMENTACAO", "OUTROS"];
export declare class CreateTravelExpenseDto {
    employeeName?: string;
    department?: string;
    description?: string;
    category?: typeof CATEGORIES[number];
    city?: string;
    state?: string;
    expenseDate?: string;
    currency?: string;
    amount: number;
    receiptUrl?: string;
}
export {};
