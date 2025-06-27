import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(createSupplierDto: CreateSupplierDto): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: number;
        email: string | null;
        name: string;
        cnpj: string | null;
        phone: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        email: string | null;
        name: string;
        cnpj: string | null;
        phone: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        cnpj: string | null;
        phone: string | null;
    }>;
    update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<{
        id: number;
        email: string | null;
        name: string;
        cnpj: string | null;
        phone: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        cnpj: string | null;
        phone: string | null;
    }>;
}
