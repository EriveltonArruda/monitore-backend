import { PrismaService } from 'src/prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByAccountId(accountId: number): Promise<{
        id: number;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        createdAt: Date;
        bankAccount: string | null;
    }[]>;
    create(data: {
        accountId: number;
        paidAt: Date;
        amount: number;
        bankAccount?: string;
    }): Promise<{
        id: number;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        createdAt: Date;
        bankAccount: string | null;
    }>;
}
