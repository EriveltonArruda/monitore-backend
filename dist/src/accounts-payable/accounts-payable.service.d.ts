import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
interface FindAllAccountsParams {
    page: number;
    limit: number;
    month?: number;
    year?: number;
}
export declare class AccountsPayableService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): Prisma.Prisma__AccountPayableClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(params: FindAllAccountsParams): Promise<{
        data: {
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
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
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
    }>;
}
export {};
