import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findByAccountId(accountId: string): Promise<{
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
        id: number;
        createdAt: Date;
    }[]>;
    createPayment(body: CreatePaymentDto): Promise<{
        accountId: number;
        paidAt: Date;
        amount: number | null;
        bankAccount: string | null;
        id: number;
        createdAt: Date;
    }>;
}
