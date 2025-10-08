export declare class UpdateContractDto {
    code?: string;
    description?: string;
    municipalityId?: number;
    departmentId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    monthlyValue?: number;
    active?: boolean;
    status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO' | 'PENDENTE';
}
