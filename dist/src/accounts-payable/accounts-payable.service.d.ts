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
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(params: FindAllAccountsParams): Promise<{
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
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<{
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
    }>;
    registerPayment(accountId: number, paidAt: Date): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }>;
}
export {};
