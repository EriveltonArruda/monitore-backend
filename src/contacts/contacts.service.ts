import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: createContactDto,
    });
  }

  // CORREÇÃO APLICADA AQUI:
  // Substituímos o texto padrão pela lógica real que busca
  // todos os contatos no banco de dados e os ordena por nome.
  findAll() {
    return this.prisma.contact.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contato com ID #${id} não encontrado.`);
    }
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.findOne(id); // Garante que o contato existe antes de tentar atualizar
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Garante que o contato existe antes de tentar deletar
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
