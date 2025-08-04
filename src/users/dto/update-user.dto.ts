import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto, UserRole, UserModule } from './create-user.dto';
import { IsOptional, IsIn, IsArray } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  // NOVO: permite atualizar a lista de módulos
  @IsOptional()
  @IsArray()
  @IsIn(Object.values(UserModule), { each: true })
  modules?: UserModule[];
}
