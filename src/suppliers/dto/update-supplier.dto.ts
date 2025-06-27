import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';

/**
 * Este DTO (Data Transfer Object) define como os dados para ATUALIZAR um fornecedor devem se parecer.
 *
 * Ele usa o 'PartialType' do NestJS, que é uma ferramenta muito poderosa.
 * Ele pega todas as propriedades e regras de validação do 'CreateSupplierDto'
 * e as torna opcionais. Isso significa que, ao atualizar um fornecedor, o usuário
 * não precisa enviar todos os campos novamente, apenas aqueles que ele deseja alterar.
 */
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
