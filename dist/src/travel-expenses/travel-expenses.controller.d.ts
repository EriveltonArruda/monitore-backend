import { TravelExpensesService } from './travel-expenses.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
export declare class TravelExpensesController {
    private readonly service;
    constructor(service: TravelExpensesService);
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
    findAll(page?: string, pageSize?: string, month?: string, year?: string, status?: string, category?: string, search?: string): Promise<{
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
    listReimbursements(id: number): Promise<{
        amount: number;
        id: number;
        createdAt: Date;
        notes: string | null;
        bankAccount: string | null;
        reimbursedAt: Date;
        amountCents: number;
        travelExpenseId: number;
    }[]>;
    addReimbursement(id: number, dto: CreateReimbursementDto): Promise<any>;
    deleteReimbursement(id: number, reimbursementId: number): Promise<{
        deleted: boolean;
    }>;
    listAdvances(id: number): Promise<{
        amount: number;
        id: number;
        createdAt: Date;
        notes: string | null;
        amountCents: number;
        travelExpenseId: number;
        issuedAt: Date;
        method: string | null;
    }[]>;
    addAdvance(id: number, dto: {
        amount: number;
        issuedAt?: string;
        method?: string;
        notes?: string;
    }): Promise<any>;
    deleteAdvance(id: number, advanceId: number): Promise<{
        deleted: boolean;
    }>;
    listReturns(id: number): Promise<{
        amount: number;
        id: number;
        createdAt: Date;
        notes: string | null;
        amountCents: number;
        travelExpenseId: number;
        method: string | null;
        returnedAt: Date;
    }[]>;
    addReturn(id: number, dto: {
        amount: number;
        returnedAt?: string;
        method?: string;
        notes?: string;
    }): Promise<any>;
    deleteReturn(id: number, returnId: number): Promise<{
        deleted: boolean;
    }>;
}
