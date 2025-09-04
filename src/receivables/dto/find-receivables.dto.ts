import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindReceivablesDto {
  @IsOptional()
  @IsNumberString()
  page?: string | number;

  @IsOptional()
  @IsNumberString()
  limit?: string | number;

  @IsOptional()
  @IsNumberString()
  contractId?: string | number;      // <— era @IsInt() se existia

  @IsOptional()
  @IsNumberString()
  municipalityId?: string | number;  // <— era @IsInt()

  @IsOptional()
  @IsNumberString()
  departmentId?: string | number;    // <— era @IsInt()

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  // Ranges de datas (YYYY-MM-DD)
  @IsOptional() @IsString() issueFrom?: string;
  @IsOptional() @IsString() issueTo?: string;

  @IsOptional() @IsString() periodFrom?: string;
  @IsOptional() @IsString() periodTo?: string;

  @IsOptional() @IsString() receivedFrom?: string;
  @IsOptional() @IsString() receivedTo?: string;

  @IsOptional()
  @IsIn(['issueDate', 'receivedAt', 'periodStart', 'createdAt'])
  orderBy?: 'issueDate' | 'receivedAt' | 'periodStart' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
