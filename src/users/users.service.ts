import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UserModule } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // Helpers para converter array <-> string para salvar modules no banco (SQLite não aceita array nativo)
  private modulesToString(modules?: string[]): string | null {
    if (!modules || !Array.isArray(modules) || modules.length === 0) return null;
    return modules.join(',');
  }
  private stringToModules(modulesStr: string | null): string[] {
    if (!modulesStr) return [];
    return modulesStr.split(',').map((m) => m.trim()).filter(Boolean);
  }

  // Cria um novo usuário, criptografando a senha antes de salvar.
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // Converte modules (array) para string antes de salvar
    const modules = this.modulesToString(createUserDto.modules);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'USER',
        modules, // Salva como string
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        createdAt: true,
        updatedAt: true
      },
    });

    // Sempre retorna modules como array na API!
    return { ...user, modules: this.stringToModules(user.modules) };
  }

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          modules: true,
          createdAt: true,
          updatedAt: true,
        },
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    // Converte modules de string para array em todos
    const usersWithModules = users.map(user => ({
      ...user,
      modules: this.stringToModules(user.modules),
    }));

    return { data: usersWithModules, total };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    // Converte modules para array no retorno
    return { ...user, modules: this.stringToModules(user.modules) };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        createdAt: true,
        updatedAt: true
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID #${id} não encontrado.`);
    }
    return { ...user, modules: this.stringToModules(user.modules) };
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    await this.findOne(id);
    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);
    const user = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true, name: true, email: true, role: true, modules: true, createdAt: true, updatedAt: true
      },
    });
    return { ...user, modules: this.stringToModules(user.modules) };
  }

  // Atualiza nome, email, role ou módulos de um usuário (mas nunca senha por aqui)
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Se vier modules (no update), transforma array em string; senão, usa o valor já salvo (user.modules, que agora é array por causa do findOne!)
    const modules =
      typeof updateUserDto.modules !== 'undefined'
        ? this.modulesToString(updateUserDto.modules)
        : this.modulesToString(user.modules); // <--- aqui aplica a conversão sempre!

    // Ignora qualquer tentativa de atualizar a senha por esse endpoint
    const { password, ...fieldsToUpdate } = updateUserDto;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: fieldsToUpdate.name ?? user.name,
        email: fieldsToUpdate.email ?? user.email,
        role: fieldsToUpdate.role ?? user.role,
        modules, // Salva sempre como string
      },
      select: {
        id: true, name: true, email: true, role: true, modules: true, createdAt: true, updatedAt: true
      },
    });

    return { ...updated, modules: this.stringToModules(updated.modules) };
  }

  async remove(id: number) {
    await this.findOne(id);
    const user = await this.prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true, role: true, modules: true, createdAt: true, updatedAt: true },
    });
    return { ...user, modules: this.stringToModules(user.modules) };
  }
}
