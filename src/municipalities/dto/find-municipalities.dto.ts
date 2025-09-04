import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindMunicipalitiesDto {
  @IsOptional()
  @IsNumberString()
  page?: string | number;

  @IsOptional()
  @IsNumberString()
  limit?: string | number;

  @IsOptional()
  @IsString()
  search?: string; // por nome ou cnpj
}
