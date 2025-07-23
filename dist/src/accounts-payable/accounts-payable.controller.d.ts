import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): import(".prisma/client").Prisma.Prisma__AccountPayableClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(page?: string, limit?: string, month?: string, year?: string): Promise<{
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
}
