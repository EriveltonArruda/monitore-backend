import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';

// Lista de status permitidos para validação
const allowedStatus = ['A_PAGAR', 'PAGO', 'VENCIDO'];

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
}