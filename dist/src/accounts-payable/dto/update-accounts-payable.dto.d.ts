import { CreateAccountsPayableDto } from './create-accounts-payable.dto';
declare const UpdateAccountsPayableDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAccountsPayableDto>>;
export declare class UpdateAccountsPayableDto extends UpdateAccountsPayableDto_base {
    installments?: number | null;
    currentInstallment?: number | null;
    isRecurring?: boolean;
    recurringUntil?: Date;
    paymentAmount?: string | number;
    bankAccount?: string;
    paidAt?: Date;
}
export {};
