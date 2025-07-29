import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findByAccountId(accountId: string): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        accountId: number;
        paidAt: Date;
        amount: number | null;
    }[]>;
    createPayment(body: CreatePaymentDto): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        accountId: number;
        paidAt: Date;
        amount: number | null;
    }>;
    updatePayment(id: number, body: {
        paidAt?: string;
        amount?: number;
        bankAccount?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        accountId: number;
        paidAt: Date;
        amount: number | null;
    }>;
    removePayment(id: number): Promise<{
        id: number;
        createdAt: Date;
        bankAccount: string | null;
        accountId: number;
        paidAt: Date;
        amount: number | null;
    }>;
}
