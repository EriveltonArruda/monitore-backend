import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createContactDto: CreateContactDto): import(".prisma/client").Prisma.Prisma__ContactClient<{
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateContactDto: UpdateContactDto): Promise<{
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
