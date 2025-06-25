import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoria com ID #${id} não encontrada.`);
    }
    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    // Primeiro, usamos nosso próprio método findOne para checar se a categoria existe.
    // Se não existir, o findOne já vai disparar o erro 404 para nós.
    await this.findOne(id);

    // Se a linha acima não deu erro, significa que a categoria foi encontrada.
    // Agora sim podemos deletá-la com segurança.
    return this.prisma.category.delete({
      where: { id },
    });
  }
}