import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
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
    findAll(page?: string, limit?: string): Promise<{
        data: {
            id: number;
            name: string;
            company: string | null;
            email: string | null;
            phone: string | null;
            type: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
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
