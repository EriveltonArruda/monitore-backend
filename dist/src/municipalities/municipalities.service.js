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
exports.MunicipalitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MunicipalitiesService = class MunicipalitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.municipality.create({
            data: {
                name: dto.name,
                cnpj: dto.cnpj ?? null,
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 20);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search && query.search.trim() !== '') {
            where.OR = [
                { name: { contains: query.search.trim(), mode: 'insensitive' } },
                { cnpj: { contains: query.search.trim(), mode: 'insensitive' } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.municipality.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.municipality.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findOne(id) {
        const row = await this.prisma.municipality.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Município não encontrado.');
        return row;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.municipality.update({
            where: { id },
            data: {
                name: dto.name ?? undefined,
                cnpj: dto.cnpj ?? undefined,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.municipality.delete({ where: { id } });
        return { success: true };
    }
};
exports.MunicipalitiesService = MunicipalitiesService;
exports.MunicipalitiesService = MunicipalitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MunicipalitiesService);
//# sourceMappingURL=municipalities.service.js.map