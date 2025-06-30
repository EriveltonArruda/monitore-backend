import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do contato não pode estar vazio.' })
  name: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  type?: string;
}