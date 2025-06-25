import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSupplierDto: CreateSupplierDto): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        name: string;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
    }>;
    update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<{
        name: string;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
    }>;
}
