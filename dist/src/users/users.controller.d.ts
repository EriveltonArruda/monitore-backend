import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
    }>;
    findAll(page?: string, limit?: string, search?: string): Promise<{
        data: {
            id: number;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{
        id: number;
        email: string;
        name: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
