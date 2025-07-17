import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createContactDto: CreateContactDto): import(".prisma/client").Prisma.Prisma__ContactClient<{
        id: number;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        type: string;
        company: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(params: {
        page: number;
        limit: number;
    }): Promise<{
        data: {
            id: number;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            type: string;
            company: string | null;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        type: string;
        company: string | null;
    }>;
    update(id: number, updateContactDto: UpdateContactDto): Promise<{
        id: number;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        type: string;
        company: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        type: string;
        company: string | null;
    }>;
}
