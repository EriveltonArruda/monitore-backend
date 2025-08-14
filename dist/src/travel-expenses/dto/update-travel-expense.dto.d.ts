import { CreateTravelExpenseDto } from './create-travel-expense.dto';
declare const STATUSES: readonly ["PENDENTE", "PARCIAL", "REEMBOLSADO"];
declare const UpdateTravelExpenseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTravelExpenseDto>>;
export declare class UpdateTravelExpenseDto extends UpdateTravelExpenseDto_base {
    status?: typeof STATUSES[number];
    amount?: number;
}
export {};
