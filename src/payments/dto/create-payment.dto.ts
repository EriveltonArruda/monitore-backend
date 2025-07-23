import { IsNumber, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNumber()
  accountId: number;

  @Type(() => Date)
  @IsDate()
  paidAt: Date;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}