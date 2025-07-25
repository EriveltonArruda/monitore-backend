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
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: { ...createUserDto, password: hashedPassword },
            select: { id: true, name: true, email: true }
        });
    }
    async findAll(params) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count(),
        ]);
        return { data: users, total };
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID #${id} não encontrado.`);
        }
        return user;
    }
    async changePassword(id, changePasswordDto) {
        await this.findOne(id);
        const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: { id: true, name: true, email: true }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map