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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createContactDto) {
        return this.prisma.contact.create({ data: createContactDto });
    }
    async findAll(params) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        const [contacts, total] = await this.prisma.$transaction([
            this.prisma.contact.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.contact.count({ where }),
        ]);
        return {
            data: contacts,
            total,
        };
    }
    async findOne(id) {
        const contact = await this.prisma.contact.findUnique({ where: { id } });
        if (!contact) {
            throw new common_1.NotFoundException(`Contato com ID #${id} não encontrado.`);
        }
        return contact;
    }
    async update(id, updateContactDto) {
        await this.findOne(id);
        return this.prisma.contact.update({
            where: { id },
            data: updateContactDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.contact.delete({ where: { id } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map