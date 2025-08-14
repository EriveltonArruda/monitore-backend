import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { Response } from 'express';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(dto: CreateAccountsPayableDto): Promise<{
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
                accountId: number;
                paidAt: Date;
                amount: number | null;
                bankAccount: string | null;
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
    getMonthlyReport(year?: string, category?: string, status?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    exportListPdf(res: Response, month?: string, year?: string, status?: string, category?: string, search?: string): Promise<void>;
    exportOnePdf(id: number, res: Response): Promise<void>;
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
    update(id: number, dto: UpdateAccountsPayableDto): Promise<{
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
