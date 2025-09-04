import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
type CreateReimbursementShape = {
    amount: number;
    reimbursedAt?: string;
    bankAccount?: string;
    notes?: string;
};
type CreateAdvanceDto = {
    amount: number;
    issuedAt?: string;
    method?: string;
    notes?: string;
};
type CreateReturnDto = {
    amount: number;
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
        createdAt: Date;
        updatedAt: Date;
        department: string | null;
        description: string | null;
        status: string;
        category: string;
        currency: string | null;
        employeeName: string | null;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        receiptUrl: string | null;
        amountCents: number;
        reimbursedCents: number;
    }>;
    create(dto: CreateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        department: string | null;
        description: string | null;
        status: string;
        category: string;
        currency: string | null;
        employeeName: string | null;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        receiptUrl: string | null;
        amountCents: number;
        reimbursedCents: number;
    }>;
    private getTotals;
    private computeStatus;
    private recalcAndUpdateStatus;
    findAll(params?: {
        page?: number;
        pageSize?: number;
        month?: number;
        year?: number;
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
            createdAt: Date;
            updatedAt: Date;
            department: string | null;
            description: string | null;
            status: string;
            category: string;
            currency: string | null;
            employeeName: string | null;
            city: string | null;
            state: string | null;
            expenseDate: Date | null;
            receiptUrl: string | null;
            amountCents: number;
            reimbursedCents: number;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        amount: number;
        reimbursedAmount: number;
        reimbursements: {
            amount: number;
            id: number;
            createdAt: Date;
            notes: string | null;
            bankAccount: string | null;
            reimbursedAt: Date;
            amountCents: number;
            travelExpenseId: number;
        }[];
        advances: {
            amount: number;
            id: number;
            createdAt: Date;
            notes: string | null;
            amountCents: number;
            travelExpenseId: number;
            issuedAt: Date;
            method: string | null;
        }[];
        returns: {
            amount: number;
            id: number;
            createdAt: Date;
            notes: string | null;
            amountCents: number;
            travelExpenseId: number;
            method: string | null;
            returnedAt: Date;
        }[];
        id: number;
        createdAt: Date;
        updatedAt: Date;
        department: string | null;
        description: string | null;
        status: string;
        category: string;
        currency: string | null;
        employeeName: string | null;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        receiptUrl: string | null;
        amountCents: number;
        reimbursedCents: number;
    }>;
    update(id: number, dto: UpdateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        department: string | null;
        description: string | null;
        status: string;
        category: string;
        currency: string | null;
        employeeName: string | null;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        receiptUrl: string | null;
        amountCents: number;
        reimbursedCents: number;
    }>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    listReimbursements(expenseId: number): Promise<{
        amount: number;
        id: number;
        createdAt: Date;
        notes: string | null;
        bankAccount: string | null;
        reimbursedAt: Date;
        amountCents: number;
        travelExpenseId: number;
    }[]>;
    addReimbursement(expenseId: number, dto: CreateReimbursementDto & CreateReimbursementShape): Promise<any>;
    deleteReimbursement(expenseId: number, reimbursementId: number): Promise<{
        deleted: boolean;
    }>;
    listAdvances(expenseId: number): Promise<{
        amount: number;
        id: number;
        createdAt: Date;
        notes: string | null;
        amountCents: number;
        travelExpenseId: number;
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
        createdAt: Date;
        notes: string | null;
        amountCents: number;
        travelExpenseId: number;
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
