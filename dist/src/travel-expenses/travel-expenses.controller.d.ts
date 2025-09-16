import { Response } from 'express';
import { TravelExpensesService } from './travel-expenses.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
export declare class TravelExpensesController {
    private readonly service;
    constructor(service: TravelExpensesService);
    private buildExportFilename;
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
    findAll(page?: string, pageSize?: string, month?: string, year?: string, status?: string, category?: string, search?: string): Promise<{
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
    exportCsv(query: any, res: Response): Promise<void>;
    exportPdf(query: any, res: Response): Promise<void>;
    listReimbursements(id: number): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        reimbursedAt: Date;
        travelExpenseId: number;
        bankAccount: string | null;
        notes: string | null;
    }[]>;
    addReimbursement(id: number, dto: CreateReimbursementDto): Promise<any>;
    deleteReimbursement(id: number, reimbursementId: number): Promise<{
        deleted: boolean;
    }>;
    listAdvances(id: number): Promise<{
        amount: number;
        id: number;
        amountCents: number;
        createdAt: Date;
        travelExpenseId: number;
        notes: string | null;
        issuedAt: Date;
        method: string | null;
    }[]>;
    addAdvance(id: number, dto: {
        amount: number | string;
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
        amountCents: number;
        createdAt: Date;
        travelExpenseId: number;
        notes: string | null;
        method: string | null;
        returnedAt: Date;
    }[]>;
    addReturn(id: number, dto: {
        amount: number | string;
        returnedAt?: string;
        method?: string;
        notes?: string;
    }): Promise<any>;
    deleteReturn(id: number, returnId: number): Promise<{
        deleted: boolean;
    }>;
}
