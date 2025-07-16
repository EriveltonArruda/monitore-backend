import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) { }

  create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({ data: createContactDto });
  }

  // O método agora é 'async' e retorna um objeto paginado
  async findAll(params: { page: number, limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [contacts, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.contact.count(),
    ]);

    return {
      data: contacts,
      total,
    };
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contato com ID #${id} não encontrado.`);
    }
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}