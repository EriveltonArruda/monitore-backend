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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        status: string;
        value: number;
        dueDate: Date;
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
    }>;
}
