import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: string, limit?: string, search?: string): Promise<{
        data: {
            modules: string[];
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMe(req: any): Promise<{
        modules: string[];
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
