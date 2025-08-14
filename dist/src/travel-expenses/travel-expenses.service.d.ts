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
export declare class TravelExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        receiptUrl: string | null;
        id: number;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
            employeeName: string | null;
            department: string | null;
            description: string | null;
            category: string;
            city: string | null;
            state: string | null;
            expenseDate: Date | null;
            currency: string | null;
            receiptUrl: string | null;
            id: number;
            amountCents: number;
            reimbursedCents: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
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
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        receiptUrl: string | null;
        id: number;
        amountCents: number;
        reimbursedCents: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateTravelExpenseDto): Promise<{
        amount: number;
        reimbursedAmount: number;
        employeeName: string | null;
        department: string | null;
        description: string | null;
        category: string;
        city: string | null;
        state: string | null;
        expenseDate: Date | null;
        currency: string | null;
        receiptUrl: string | null;
        id: number;
        amountCents: number;
        reimbursedCents: number;
        status: string;
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
    addReimbursement(expenseId: number, dto: CreateReimbursementDto & CreateReimbursementShape): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        reimbursedAt: Date;
        travelExpenseId: number;
        bankAccount: string | null;
        notes: string | null;
    }>;
    deleteReimbursement(expenseId: number, reimbursementId: number): Promise<{
        deleted: boolean;
    }>;
    private ensureExists;
}
export {};
