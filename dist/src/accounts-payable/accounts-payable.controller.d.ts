import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        createdAt: Date;
        updatedAt: Date;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    findAll(page?: string, limit?: string, month?: string, year?: string, status?: string, category?: string, search?: string): Promise<{
        data: ({
            payments: {
                id: number;
                createdAt: Date;
                accountId: number;
                paidAt: Date;
                amount: number | null;
                bankAccount: string | null;
            }[];
        } & {
            id: number;
            name: string;
            category: string;
            value: number;
            dueDate: Date;
            status: string;
            installmentType: string;
            installments: number | null;
            currentInstallment: number | null;
            createdAt: Date;
            updatedAt: Date;
            isRecurring: boolean;
            recurringUntil: Date | null;
            recurringSourceId: number | null;
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        payments: {
            id: number;
            createdAt: Date;
            accountId: number;
            paidAt: Date;
            amount: number | null;
            bankAccount: string | null;
        }[];
    } & {
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        createdAt: Date;
        updatedAt: Date;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        createdAt: Date;
        updatedAt: Date;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        createdAt: Date;
        updatedAt: Date;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
}
