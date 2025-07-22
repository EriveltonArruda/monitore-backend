import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findByAccountId(accountId: string): Promise<{
        id: number;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        createdAt: Date;
    }[]>;
    createPayment(body: CreatePaymentDto): Promise<{
        id: number;
        accountId: number;
        paidAt: Date;
        amount: number | null;
        createdAt: Date;
    }>;
}
