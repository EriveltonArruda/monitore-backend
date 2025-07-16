import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AccountsPayableService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAccountsPayableDto: CreateAccountsPayableDto): import(".prisma/client").Prisma.Prisma__AccountPayableClient<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(params: {
        page: number;
        limit: number;
    }): Promise<{
        data: {
            id: number;
            name: string;
            category: string;
            value: number;
            dueDate: Date;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        category: string;
        value: number;
        dueDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
