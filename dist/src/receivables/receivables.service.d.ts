import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { FindReceivablesDto } from './dto/find-receivables.dto';
export declare class ReceivablesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateReceivableDto): Promise<{
        contract: {
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
        } & {
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        contractId: number;
    }>;
    findAll(query: FindReceivablesDto): Promise<{
        data: ({
            contract: {
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
            } & {
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
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            noteNumber: string | null;
            issueDate: Date | null;
            grossAmount: number | null;
            netAmount: number | null;
            periodLabel: string | null;
            periodStart: Date | null;
            periodEnd: Date | null;
            deliveryDate: Date | null;
            receivedAt: Date | null;
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
        } & {
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        contractId: number;
    }>;
    update(id: number, dto: UpdateReceivableDto): Promise<{
        contract: {
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
        } & {
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        contractId: number;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    findForExport(query: FindReceivablesDto): Promise<({
        contract: {
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
        } & {
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        noteNumber: string | null;
        issueDate: Date | null;
        grossAmount: number | null;
        netAmount: number | null;
        periodLabel: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        deliveryDate: Date | null;
        receivedAt: Date | null;
        contractId: number;
    })[]>;
}
