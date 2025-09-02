import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { Response } from 'express';
import { GetPayablesStatusQueryDto } from './dto/get-payables-status.dto';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(dto: CreateAccountsPayableDto): Promise<{
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
        data: {
            daysToDue: number;
            alertTag: "VENCIDO" | "D-3" | "D-7" | null;
            payments: {
                id: number;
                createdAt: Date;
                accountId: number;
                paidAt: Date;
                amount: number | null;
                bankAccount: string | null;
            }[];
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
        }[];
        total: number;
    }>;
    getPayablesStatus(query: GetPayablesStatusQueryDto): Promise<{
        period: {
            from: string;
            to: string;
        } | null;
        totals: {
            count: number;
            amount: number;
        };
        buckets: {
            VENCIDO: {
                count: number;
                amount: number;
            };
            ABERTO: {
                count: number;
                amount: number;
            };
            PAGO: {
                count: number;
                amount: number;
            };
        };
        currency: string;
        generatedAt: string;
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
        daysToDue: number;
        alertTag: "VENCIDO" | "D-3" | "D-7" | null;
        payments: {
            id: number;
            createdAt: Date;
            accountId: number;
            paidAt: Date;
            amount: number | null;
            bankAccount: string | null;
        }[];
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
    update(id: number, dto: UpdateAccountsPayableDto): Promise<{
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
