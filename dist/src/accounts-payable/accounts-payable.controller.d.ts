import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): import(".prisma/client").Prisma.Prisma__AccountPayableClient<{
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(page?: string, limit?: string, month?: string, year?: string): Promise<{
        data: {
            name: string;
            category: string;
            value: number;
            dueDate: Date;
            status: string;
            installmentType: string;
            installments: number | null;
            currentInstallment: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto): Promise<{
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        installmentType: string;
        installments: number | null;
        currentInstallment: number | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
