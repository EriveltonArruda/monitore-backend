import { PrismaService } from 'src/prisma/prisma.service';
import { ApplyToStockDto } from './dto/apply-to-stock.dto';
type FindAllParams = {
    search?: string;
    page?: number;
    limit?: number;
};
export declare class NfeImportsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll({ search, page, limit }: FindAllParams): Promise<{
        data: {
            number: string | null;
            id: number;
            createdAt: Date;
            issueDate: Date | null;
            destName: string | null;
            emitterName: string | null;
            accessKey: string | null;
            series: string | null;
            totalAmount: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOneFull(id: number): Promise<{
        items: {
            id: number;
            description: string | null;
            total: number | null;
            unit: string | null;
            quantity: number | null;
            productCode: string | null;
            unitPrice: number | null;
            nfeImportId: number;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        issueDate: Date | null;
        destName: string | null;
        emitterName: string | null;
        accessKey: string | null;
        rawXmlPath: string;
        series: string | null;
        emitterCnpj: string | null;
        destCnpj: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    createFromXml(savedPath: string): Promise<{
        items: {
            id: number;
            description: string | null;
            total: number | null;
            unit: string | null;
            quantity: number | null;
            productCode: string | null;
            unitPrice: number | null;
            nfeImportId: number;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        issueDate: Date | null;
        destName: string | null;
        emitterName: string | null;
        accessKey: string | null;
        rawXmlPath: string;
        series: string | null;
        emitterCnpj: string | null;
        destCnpj: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    reprocess(id: number): Promise<{
        items: {
            id: number;
            description: string | null;
            total: number | null;
            unit: string | null;
            quantity: number | null;
            productCode: string | null;
            unitPrice: number | null;
            nfeImportId: number;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        issueDate: Date | null;
        destName: string | null;
        emitterName: string | null;
        accessKey: string | null;
        rawXmlPath: string;
        series: string | null;
        emitterCnpj: string | null;
        destCnpj: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    getRawXmlPath(id: number): Promise<{
        abs: string;
        filename: string;
    }>;
    update(id: number, dto: any): Promise<{
        number: string | null;
        id: number;
        createdAt: Date;
        issueDate: Date | null;
        destName: string | null;
        emitterName: string | null;
        accessKey: string | null;
        rawXmlPath: string;
        series: string | null;
        emitterCnpj: string | null;
        destCnpj: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    remove(id: number): Promise<{
        number: string | null;
        id: number;
        createdAt: Date;
        issueDate: Date | null;
        destName: string | null;
        emitterName: string | null;
        accessKey: string | null;
        rawXmlPath: string;
        series: string | null;
        emitterCnpj: string | null;
        destCnpj: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    applyToStock(id: number, dto: ApplyToStockDto): Promise<{
        ok: boolean;
        movementsCreated: number;
    }>;
    attachPdf(id: number, savedPath: string): Promise<{
        ok: boolean;
        pdfPath: string | null;
    }>;
    getPdfPath(id: number): Promise<{
        abs: string;
        filename: string;
    }>;
    removePdf(id: number): Promise<void>;
    private absPath;
    private ensureExists;
    private parseXml;
    private mapParsedToModel;
}
export {};
