import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn, MinLength, IsArray, ArrayNotEmpty } from 'class-validator';

// Enum igual ao do Prisma
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

// Enum dos módulos do sistema
export enum UserModule {
  CONTAS_PAGAR = 'CONTAS_PAGAR',
  RELATORIO_CONTAS_PAGAR = 'RELATORIO_CONTAS_PAGAR',
  ESTOQUE = 'ESTOQUE',
  MOVIMENTACOES = 'MOVIMENTACOES',
  RELATORIOS = 'RELATORIOS',
  FORNECEDORES = 'FORNECEDORES',
  CATEGORIAS = 'CATEGORIAS',
  DASHBOARD = 'DASHBOARD',
  CONTATOS = 'CONTATOS',
  USUARIOS = 'USUARIOS',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  // NOVO: lista de módulos de acesso (opcional, pode ser vazio)
  @IsOptional()
  @IsArray()
  @IsIn(Object.values(UserModule), { each: true })
  modules?: UserModule[];
}
