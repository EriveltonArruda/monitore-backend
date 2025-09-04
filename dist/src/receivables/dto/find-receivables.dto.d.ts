export declare class FindReceivablesDto {
    page?: string | number;
    limit?: string | number;
    contractId?: string | number;
    municipalityId?: string | number;
    departmentId?: string | number;
    status?: string;
    search?: string;
    issueFrom?: string;
    issueTo?: string;
    periodFrom?: string;
    periodTo?: string;
    receivedFrom?: string;
    receivedTo?: string;
    orderBy?: 'issueDate' | 'receivedAt' | 'periodStart' | 'createdAt';
    order?: 'asc' | 'desc';
}
