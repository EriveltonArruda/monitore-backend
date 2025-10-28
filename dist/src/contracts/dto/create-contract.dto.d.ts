export declare class CreateContractDto {
    code: string;
    description?: string;
    municipalityId: number;
    departmentId?: number;
    startDate?: string;
    endDate?: string;
    monthlyValue?: number;
    active?: boolean;
    attachmentUrl?: string | null;
    status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO' | 'PENDENTE';
}
