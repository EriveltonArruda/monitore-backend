import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindDepartmentsDto {
  @IsOptional()
  @IsNumberString()
  page?: string | number;

  @IsOptional()
  @IsNumberString()
  limit?: string | number;

  @IsOptional()
  @IsNumberString()
  municipalityId?: string | number; // <— era @IsInt()

  @IsOptional()
  @IsString()
  search?: string;
}
