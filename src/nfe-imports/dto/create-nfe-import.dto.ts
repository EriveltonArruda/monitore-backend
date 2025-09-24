import { IsOptional, IsString } from 'class-validator';

export class CreateNfeImportDto {
  // Mantido para compatibilidade se quiser criar via JSON (não recomendado no MVP)
  @IsOptional()
  @IsString()
  rawXmlPath?: string;
}
