"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    modulesToString(modules) {
        if (!modules || !Array.isArray(modules) || modules.length === 0)
            return null;
        return modules.join(',');
    }
    stringToModules(modulesStr) {
        if (!modulesStr)
            return [];
        return modulesStr.split(',').map((m) => m.trim()).filter(Boolean);
    }
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const modules = this.modulesToString(createUserDto.modules);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                role: createUserDto.role || 'USER',
                modules,
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
        return { ...user, modules: this.stringToModules(user.modules) };
    }
    async findAll(params) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;
        const where = {};
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
        const usersWithModules = users.map(user => ({
            ...user,
            modules: this.stringToModules(user.modules),
        }));
        return { data: usersWithModules, total };
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return null;
        return { ...user, modules: this.stringToModules(user.modules) };
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Usuário com ID #${id} não encontrado.`);
        }
        return { ...user, modules: this.stringToModules(user.modules) };
    }
    async changePassword(id, changePasswordDto) {
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
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        const modules = typeof updateUserDto.modules !== 'undefined'
            ? this.modulesToString(updateUserDto.modules)
            : this.modulesToString(user.modules);
        const { password, ...fieldsToUpdate } = updateUserDto;
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                name: fieldsToUpdate.name ?? user.name,
                email: fieldsToUpdate.email ?? user.email,
                role: fieldsToUpdate.role ?? user.role,
                modules,
            },
            select: {
                id: true, name: true, email: true, role: true, modules: true, createdAt: true, updatedAt: true
            },
        });
        return { ...updated, modules: this.stringToModules(updated.modules) };
    }
    async remove(id) {
        await this.findOne(id);
        const user = await this.prisma.user.delete({
            where: { id },
            select: { id: true, name: true, email: true, role: true, modules: true, createdAt: true, updatedAt: true },
        });
        return { ...user, modules: this.stringToModules(user.modules) };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map