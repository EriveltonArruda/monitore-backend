import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { FindDepartmentsDto } from './dto/find-departments.dto';
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDepartmentDto): Promise<{
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
    } & {
        id: number;
        name: string;
        municipalityId: number;
    }>;
    findAll(query: FindDepartmentsDto): Promise<{
        data: ({
            municipality: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                cnpj: string | null;
            };
        } & {
            id: number;
            name: string;
            municipalityId: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
    } & {
        id: number;
        name: string;
        municipalityId: number;
    }>;
    update(id: number, dto: UpdateDepartmentDto): Promise<{
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
    } & {
        id: number;
        name: string;
        municipalityId: number;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
