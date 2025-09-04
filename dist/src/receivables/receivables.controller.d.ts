import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { FindReceivablesDto } from './dto/find-receivables.dto';
export declare class ReceivablesController {
    private readonly receivablesService;
    constructor(receivablesService: ReceivablesService);
    create(dto: CreateReceivableDto): Promise<{
        contract: {
            municipality: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                cnpj: string | null;
            };
            department: {
                id: number;
                name: string;
                municipalityId: number;
            } | null;
        } & {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            municipalityId: number;
            departmentId: number | null;
            startDate: Date | null;
            endDate: Date | null;
            monthlyValue: number | null;
            signedAt: Date | null;
            processNumber: string | null;
            active: boolean;
        };
    } & {
        id: number;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contractId: number;
    }>;
    findAll(query: FindReceivablesDto): Promise<{
        data: ({
            contract: {
                municipality: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    cnpj: string | null;
                };
                department: {
                    id: number;
                    name: string;
                    municipalityId: number;
                } | null;
            } & {
                id: number;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                description: string | null;
                municipalityId: number;
                departmentId: number | null;
                startDate: Date | null;
                endDate: Date | null;
                monthlyValue: number | null;
                signedAt: Date | null;
                processNumber: string | null;
                active: boolean;
            };
        } & {
            id: number;
            noteNumber: string | null;
            issueDate: Date | null;
            grossAmount: number | null;
            netAmount: number | null;
            periodLabel: string | null;
            periodStart: Date | null;
            periodEnd: Date | null;
            deliveryDate: Date | null;
            receivedAt: Date | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            contractId: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        contract: {
            municipality: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                cnpj: string | null;
            };
            department: {
                id: number;
                name: string;
                municipalityId: number;
            } | null;
        } & {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            municipalityId: number;
            departmentId: number | null;
            startDate: Date | null;
            endDate: Date | null;
            monthlyValue: number | null;
            signedAt: Date | null;
            processNumber: string | null;
            active: boolean;
        };
    } & {
        id: number;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contractId: number;
    }>;
    update(id: number, dto: UpdateReceivableDto): Promise<{
        contract: {
            municipality: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                cnpj: string | null;
            };
            department: {
                id: number;
                name: string;
                municipalityId: number;
            } | null;
        } & {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
            municipalityId: number;
            departmentId: number | null;
            startDate: Date | null;
            endDate: Date | null;
            monthlyValue: number | null;
            signedAt: Date | null;
            processNumber: string | null;
            active: boolean;
        };
    } & {
        id: number;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contractId: number;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
