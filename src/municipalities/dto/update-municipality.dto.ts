import { IsOptional, IsString } from 'class-validator';

export class UpdateMunicipalityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;
}
