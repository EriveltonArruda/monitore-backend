import { PrismaService } from 'src/prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByAccountId(accountId: number): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        paidAt: Date;
        accountId: number;
        amount: number | null;
    }[]>;
    create(data: {
        accountId: number;
        paidAt: Date;
        amount: number | string;
        bankAccount?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        paidAt: Date;
        accountId: number;
        amount: number | null;
    }>;
    update(id: number, data: {
        paidAt?: Date;
        amount?: number;
        bankAccount?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        paidAt: Date;
        accountId: number;
        amount: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        paidAt: Date;
        accountId: number;
        amount: number | null;
    }>;
}
