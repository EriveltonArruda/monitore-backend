import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findByAccountId(accountId: string): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }[]>;
    createPayment(body: CreatePaymentDto): Promise<{
        id: number;
        createdAt: Date;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
    }>;
}
