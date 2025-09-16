import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FindContractsDto } from './dto/find-contracts.dto';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    create(dto: CreateContractDto): Promise<{
        daysToEnd: number | null;
        alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
        department: {
            id: number;
            name: string;
            municipalityId: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        municipalityId: number;
        code: string;
        description: string | null;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
    }>;
    findAll(query: FindContractsDto): Promise<{
        data: {
            daysToEnd: number | null;
            alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
            municipality: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                cnpj: string | null;
            };
            department: {
                id: number;
                name: string;
                municipalityId: number;
            } | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            municipalityId: number;
            code: string;
            description: string | null;
            departmentId: number | null;
            startDate: Date | null;
            endDate: Date | null;
            monthlyValue: number | null;
            status: string;
            signedAt: Date | null;
            processNumber: string | null;
            active: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        daysToEnd: number | null;
        alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
        department: {
            id: number;
            name: string;
            municipalityId: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        municipalityId: number;
        code: string;
        description: string | null;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
    }>;
    update(id: string, dto: UpdateContractDto): Promise<{
        daysToEnd: number | null;
        alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
        municipality: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        };
        department: {
            id: number;
            name: string;
            municipalityId: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        municipalityId: number;
        code: string;
        description: string | null;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
