import { Response } from 'express';
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            cnpj: string | null;
        };
        department: {
            id: number;
            municipalityId: number;
            name: string;
        } | null;
        id: number;
        code: string;
        description: string | null;
        municipalityId: number;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: FindContractsDto): Promise<{
        data: {
            daysToEnd: number | null;
            alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
            municipality: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                cnpj: string | null;
            };
            department: {
                id: number;
                municipalityId: number;
                name: string;
            } | null;
            id: number;
            code: string;
            description: string | null;
            municipalityId: number;
            departmentId: number | null;
            startDate: Date | null;
            endDate: Date | null;
            monthlyValue: number | null;
            status: string;
            signedAt: Date | null;
            processNumber: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    exportListPdf(query: FindContractsDto, res: Response): Promise<void>;
    exportOnePdf(id: number, res: Response): Promise<void>;
    findOne(id: number): Promise<{
        daysToEnd: number | null;
        alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
        municipality: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            cnpj: string | null;
        };
        department: {
            id: number;
            municipalityId: number;
            name: string;
        } | null;
        id: number;
        code: string;
        description: string | null;
        municipalityId: number;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateContractDto): Promise<{
        daysToEnd: number | null;
        alertTag: "EXPIRADO" | "D-7" | "D-30" | "HOJE" | null;
        municipality: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            cnpj: string | null;
        };
        department: {
            id: number;
            municipalityId: number;
            name: string;
        } | null;
        id: number;
        code: string;
        description: string | null;
        municipalityId: number;
        departmentId: number | null;
        startDate: Date | null;
        endDate: Date | null;
        monthlyValue: number | null;
        status: string;
        signedAt: Date | null;
        processNumber: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
