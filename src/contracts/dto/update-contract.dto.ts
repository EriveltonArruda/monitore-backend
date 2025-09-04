import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  municipalityId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number | null; // null = disconnect

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsNumber()
  monthlyValue?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;   // 👈 mudou de isActive para active

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  alertThresholdDays?: number;
}
