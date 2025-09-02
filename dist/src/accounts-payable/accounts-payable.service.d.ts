import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetPayablesStatusQueryDto } from './dto/get-payables-status.dto';
interface FindAllAccountsParams {
    page: number;
    limit: number;
    month?: number;
    year?: number;
    status?: string;
    category?: string;
    search?: string;
}
export declare class AccountsPayableService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(params: FindAllAccountsParams): Promise<{
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
    findForExportDetailed(year: number, month: number, category?: string, status?: string): Promise<{
        accounts: ({
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
        totals: {
            count: number;
            total: number;
            paid: number;
            pending: number;
        };
    }>;
    getMonthlyReport(year?: string, category?: string, status?: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        totalPages: number;
        currentPage: number;
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
    registerPayment(accountId: number, paidAt: Date): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
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
}
export {};
