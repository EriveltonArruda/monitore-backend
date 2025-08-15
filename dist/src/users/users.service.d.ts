import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    private modulesToString;
    private stringToModules;
    create(createUserDto: CreateUserDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(params: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        data: {
            modules: string[];
            id: number;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findByEmail(email: string): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        password: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findOne(id: number): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
