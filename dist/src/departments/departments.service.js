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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DepartmentsService = class DepartmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.department.create({
            data: {
                name: dto.name,
                municipality: { connect: { id: dto.municipalityId } },
            },
            include: { municipality: true },
        });
    }
    async findAll(query) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 20);
        const skip = (page - 1) * limit;
        const where = {};
        const and = [];
        if (query.municipalityId) {
            and.push({ municipalityId: Number(query.municipalityId) });
        }
        if (query.search && query.search.trim() !== '') {
            and.push({ name: { contains: query.search.trim(), mode: 'insensitive' } });
        }
        if (and.length)
            where.AND = and;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.department.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ municipalityId: 'asc' }, { name: 'asc' }],
                include: { municipality: true },
            }),
            this.prisma.department.count({ where }),
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
        const row = await this.prisma.department.findUnique({
            where: { id },
            include: { municipality: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Órgão/Secretaria não encontrado.');
        return row;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.department.update({
            where: { id },
            data: {
                name: dto.name ?? undefined,
                municipality: dto.municipalityId
                    ? { connect: { id: dto.municipalityId } }
                    : undefined,
            },
            include: { municipality: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.department.delete({ where: { id } });
        return { success: true };
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map