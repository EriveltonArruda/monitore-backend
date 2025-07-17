import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsIn,
  IsInt,
} from 'class-validator';

const allowedStatus = ['A_PAGAR', 'PAGO', 'VENCIDO'];
const allowedInstallmentTypes = ['UNICA', 'PARCELADO'];

export class CreateAccountsPayableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  value: number;

  @IsDateString()
  dueDate: Date;

  @IsString()
  @IsIn(allowedStatus)
  @IsOptional()
  status?: string;

  @IsString()
  @IsIn(allowedInstallmentTypes)
  @IsOptional()
  installmentType?: string; // UNICA ou PARCELADO

  @IsInt()
  @IsOptional()
  installments?: number | null;

  @IsInt()
  @IsOptional()
  currentInstallment?: number | null;
}