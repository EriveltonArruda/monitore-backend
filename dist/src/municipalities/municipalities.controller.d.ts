import { MunicipalitiesService } from './municipalities.service';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';
import { FindMunicipalitiesDto } from './dto/find-municipalities.dto';
export declare class MunicipalitiesController {
    private readonly municipalitiesService;
    constructor(municipalitiesService: MunicipalitiesService);
    create(dto: CreateMunicipalityDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string | null;
    }>;
    findAll(query: FindMunicipalitiesDto): Promise<{
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string | null;
    }>;
    update(id: number, dto: UpdateMunicipalityDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string | null;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
