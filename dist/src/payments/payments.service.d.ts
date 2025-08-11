import { PrismaService } from 'src/prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByAccountId(accountId: number): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }[]>;
    create(data: {
        accountId: number;
        paidAt: Date;
        amount: number | string;
        bankAccount?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }>;
    update(id: number, data: {
        paidAt?: Date;
        amount?: number;
        bankAccount?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }>;
}
