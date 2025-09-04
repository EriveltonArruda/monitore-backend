export declare class FindContractsDto {
    page?: string | number;
    limit?: string | number;
    municipalityId?: string | number;
    departmentId?: string | number;
    search?: string;
    active?: string;
    endFrom?: string;
    endTo?: string;
    dueInDays?: string | number;
    expiredOnly?: string;
    order?: 'asc' | 'desc';
}
