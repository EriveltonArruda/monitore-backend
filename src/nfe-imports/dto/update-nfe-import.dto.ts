import { PartialType } from '@nestjs/mapped-types';
import { CreateNfeImportDto } from './create-nfe-import.dto';

export class UpdateNfeImportDto extends PartialType(CreateNfeImportDto) { }
