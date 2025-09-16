import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
type CreateReimbursementShape = {
    amount: number | string;
    reimbursedAt?: string;
    bankAccount?: string;
    notes?: string;
};
type CreateAdvanceDto = {
    amount: number | string;
    issuedAt?: string;
    method?: string;
    notes?: string;
};
type CreateReturnDto = {
    amount: number | string;
    returnedAt?: string;
    method?: string;
    notes?: string;
};
export declare class TravelExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    createExpense(dto: CreateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        id: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        id: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getTotals;
    private round2c;
    private computeBalanceCents;
    private computeStatusByBalance;
    private recalcAndUpdateStatus;
    private buildWhere;
    findAll(params?: {
        page?: number;
        pageSize?: number;
        month?: number | string;
        year?: number | string;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<{
        data: {
            amount: number;
            reimbursedAmount: number;
            advancesAmount: number;
            returnsAmount: number;
            id: number;
            employeeName: string | null;
            department: string | null;
            description: string | null;
            category: string;
            city: string | null;
            state: string | null;
            expenseDate: Date | null;
            currency: string | null;
            amountCents: number;
            reimbursedCents: number;
            status: string;
            receiptUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    exportCsv(filters: {
        month?: number | string;
        year?: number | string;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<string>;
    exportPdf(filters: {
        month?: number | string;
        year?: number | string;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<Buffer>;
    findOne(id: number): Promise<{
        amount: number;
        reimbursedAmount: number;
        reimbursements: {
            amount: number;
            id: number;
            amountCents: number;
            createdAt: Date;
            reimbursedAt: Date;
            travelExpenseId: number;
            bankAccount: string | null;
            notes: string | null;
        }[];
        advances: {
            amount: number;
            id: number;
            amountCents: number;
            createdAt: Date;
            travelExpenseId: number;
            notes: string | null;
            issuedAt: Date;
            method: string | null;
        }[];
        returns: {
            amount: number;
            id: number;
            amountCents: number;
            createdAt: Date;
            travelExpenseId: number;
            notes: string | null;
            method: string | null;
            returnedAt: Date;
        }[];
        id: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        id: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    listReimbursements(expenseId: number): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        reimbursedAt: Date;
        travelExpenseId: number;
        bankAccount: string | null;
        notes: string | null;
    }[]>;
    addReimbursement(expenseId: number, dto: CreateReimbursementDto & CreateReimbursementShape): Promise<any>;
    deleteReimbursement(expenseId: number, reimbursementId: number): Promise<{
        deleted: boolean;
    }>;
    listAdvances(expenseId: number): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        travelExpenseId: number;
        notes: string | null;
        issuedAt: Date;
        method: string | null;
    }[]>;
    addAdvance(expenseId: number, dto: CreateAdvanceDto): Promise<any>;
    deleteAdvance(expenseId: number, advanceId: number): Promise<{
        deleted: boolean;
    }>;
    listReturns(expenseId: number): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        travelExpenseId: number;
        notes: string | null;
        method: string | null;
        returnedAt: Date;
    }[]>;
    addReturn(expenseId: number, dto: CreateReturnDto): Promise<any>;
    deleteReturn(expenseId: number, returnId: number): Promise<{
        deleted: boolean;
    }>;
    private ensureExists;
}
export {};
