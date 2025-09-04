import { IsOptional, IsString } from 'class-validator';

export class CreateMunicipalityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  cnpj?: string;
}
