import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSupplierDto: CreateSupplierDto): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: number;
        name: string;
        cnpj: string | null;
        phone: string | null;
        email: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(params: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        data: {
            id: number;
            name: string;
            cnpj: string | null;
            phone: string | null;
            email: string | null;
        }[];
        total: number;
    }>;
    findAllUnpaginated(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        cnpj: string | null;
        phone: string | null;
        email: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        cnpj: string | null;
        phone: string | null;
        email: string | null;
    }>;
    update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<{
        id: number;
        name: string;
        cnpj: string | null;
        phone: string | null;
        email: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        cnpj: string | null;
        phone: string | null;
        email: string | null;
    }>;
}
