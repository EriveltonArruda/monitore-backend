import { IsNumber, IsISO8601 } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  accountId: number;

  @IsISO8601()
  paidAt: string;

  @IsNumber()
  amount: number;
}