import { IsInt, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsInt()
  municipalityId: number;
}
