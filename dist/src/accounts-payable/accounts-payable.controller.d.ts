import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    findAll(page?: string, limit?: string, month?: string, year?: string, status?: string, category?: string, search?: string): Promise<{
        data: ({
            payments: {
                id: number;
                createdAt: Date;
                bankAccount: string | null;
                paidAt: Date;
                accountId: number;
                amount: number | null;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            status: string;
            value: number;
            dueDate: Date;
            installmentType: string;
            installments: number | null;
            currentInstallment: number | null;
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
            bankAccount: string | null;
            paidAt: Date;
            accountId: number;
            amount: number | null;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    getMonthlyReport(year?: string, category?: string, status?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        isRecurring: boolean;
        recurringUntil: Date | null;
        recurringSourceId: number | null;
    }>;
}
