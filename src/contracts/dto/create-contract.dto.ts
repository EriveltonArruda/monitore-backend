import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  municipalityId: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  monthlyValue?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;   // 👈 mudou de isActive para active

  @IsOptional()
  @IsString()
  notes?: string;     // 👈 campo do schema

  @IsOptional()
  @IsInt()
  alertThresholdDays?: number;  // 👈 campo opcional do schema
}
