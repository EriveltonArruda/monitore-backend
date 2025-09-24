import { NfeImportsService } from './nfe-imports.service';
import { UpdateNfeImportDto } from './dto/update-nfe-import.dto';
import type { Response } from 'express';
import { ApplyToStockDto } from './dto/apply-to-stock.dto';
export declare class NfeImportsController {
    private readonly service;
    constructor(service: NfeImportsService);
    findAll(search?: string, page?: string, limit?: string): Promise<{
        data: {
            number: string | null;
            id: number;
            createdAt: Date;
            accessKey: string | null;
            series: string | null;
            issueDate: Date | null;
            emitterName: string | null;
            destName: string | null;
            totalAmount: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<{
        items: {
            id: number;
            nfeImportId: number;
            productCode: string | null;
            description: string | null;
            quantity: number | null;
            unit: string | null;
            unitPrice: number | null;
            total: number | null;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    upload(file: Express.Multer.File): Promise<{
        items: {
            id: number;
            nfeImportId: number;
            productCode: string | null;
            description: string | null;
            quantity: number | null;
            unit: string | null;
            unitPrice: number | null;
            total: number | null;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    uploadXmlAlias(file: Express.Multer.File): Promise<{
        items: {
            id: number;
            nfeImportId: number;
            productCode: string | null;
            description: string | null;
            quantity: number | null;
            unit: string | null;
            unitPrice: number | null;
            total: number | null;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    reprocess(id: number): Promise<{
        items: {
            id: number;
            nfeImportId: number;
            productCode: string | null;
            description: string | null;
            quantity: number | null;
            unit: string | null;
            unitPrice: number | null;
            total: number | null;
        }[];
    } & {
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    applyToStock(id: number, dto: ApplyToStockDto): Promise<{
        ok: boolean;
        movementsCreated: number;
    }>;
    downloadXmlOld(id: number, res: Response): Promise<void>;
    downloadXml(id: number, res: Response): Promise<void>;
    uploadPdf(id: number, file: Express.Multer.File): Promise<{
        ok: boolean;
        pdfPath: string | null;
    }>;
    getPdf(id: number, res: Response): Promise<void>;
    deletePdf(id: number): Promise<{
        ok: boolean;
    }>;
    update(id: number, updateNfeImportDto: UpdateNfeImportDto): Promise<{
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
    remove(id: number): Promise<{
        number: string | null;
        id: number;
        createdAt: Date;
        rawXmlPath: string;
        accessKey: string | null;
        series: string | null;
        issueDate: Date | null;
        emitterCnpj: string | null;
        emitterName: string | null;
        destCnpj: string | null;
        destName: string | null;
        totalAmount: number | null;
        pdfPath: string | null;
    }>;
}
