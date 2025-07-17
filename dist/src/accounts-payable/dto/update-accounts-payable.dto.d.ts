import { CreateAccountsPayableDto } from './create-accounts-payable.dto';
declare const UpdateAccountsPayableDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAccountsPayableDto>>;
export declare class UpdateAccountsPayableDto extends UpdateAccountsPayableDto_base {
    installments?: number | null;
    currentInstallment?: number | null;
}
export {};
