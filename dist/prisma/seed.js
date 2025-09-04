"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function upsertUsers() {
    console.log('👤 Seeding users...');
    const adminPassword = await bcrypt.hash('supersecret', 10);
    await prisma.user.upsert({
        where: { email: 'admin@monitore.com' },
        update: {},
        create: {
            email: 'admin@monitore.com',
            name: 'Admin Principal',
            password: adminPassword,
            role: 'ADMIN',
            modules: '*',
        },
    });
    const eriveltonPassword = await bcrypt.hash('ErvMonitore1569', 10);
    await prisma.user.upsert({
        where: { email: 'erivelton@monitore.com' },
        update: {},
        create: {
            email: 'erivelton@monitore.com',
            name: 'Erivelton',
            password: eriveltonPassword,
            role: 'ADMIN',
            modules: '*',
        },
    });
}
async function upsertMunicipalities() {
    console.log('🏙️  Seeding municipalities...');
    const names = [
        'Paulista',
        'Igarassu',
        'Vitória de Santo Antão',
        'Gravatá',
        'Brejo da Madre de Deus',
        'Alagoa Nova',
        'Camaragibe',
    ];
    const map = new Map();
    for (const name of names) {
        const m = await prisma.municipality.upsert({
            where: { name },
            update: {},
            create: { name, cnpj: null },
        });
        map.set(name, m.id);
    }
    return map;
}
async function upsertDepartments(muniMap) {
    console.log('🏢 Seeding departments...');
    const created = new Map();
    const paulId = muniMap.get('Paulista');
    const saudePaul = await prisma.department.upsert({
        where: { municipalityId_name: { municipalityId: paulId, name: 'Saúde' } },
        update: {},
        create: { name: 'Saúde', municipality: { connect: { id: paulId } } },
    });
    const educPaul = await prisma.department.upsert({
        where: { municipalityId_name: { municipalityId: paulId, name: 'Educação' } },
        update: {},
        create: { name: 'Educação', municipality: { connect: { id: paulId } } },
    });
    created.set('Paulista', { saudeId: saudePaul.id, educacaoId: educPaul.id });
    for (const key of muniMap.keys()) {
        if (key === 'Paulista')
            continue;
        const mid = muniMap.get(key);
        const saude = await prisma.department.upsert({
            where: { municipalityId_name: { municipalityId: mid, name: 'Saúde' } },
            update: {},
            create: { name: 'Saúde', municipality: { connect: { id: mid } } },
        });
        created.set(key, { saudeId: saude.id });
    }
    return created;
}
async function upsertContracts(muniMap, depMap) {
    console.log('📄 Seeding contracts...');
    const paulId = muniMap.get('Paulista');
    const depPaul = depMap.get('Paulista');
    const ct1 = await prisma.contract.upsert({
        where: { municipalityId_code: { municipalityId: paulId, code: 'CT 001/2025' } },
        update: {
            description: 'Serviços de Saúde 2025',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-12-31'),
            monthlyValue: 50000,
            department: { connect: { id: depPaul.saudeId } },
        },
        create: {
            code: 'CT 001/2025',
            description: 'Serviços de Saúde 2025',
            municipality: { connect: { id: paulId } },
            department: { connect: { id: depPaul.saudeId } },
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-12-31'),
            monthlyValue: 50000,
            status: 'ATIVO',
        },
    });
    const ct2 = await prisma.contract.upsert({
        where: { municipalityId_code: { municipalityId: paulId, code: 'CT 002/2025' } },
        update: {
            description: 'Educação Digital 2025',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-08-31'),
            monthlyValue: 35000,
            department: depPaul.educacaoId ? { connect: { id: depPaul.educacaoId } } : undefined,
        },
        create: {
            code: 'CT 002/2025',
            description: 'Educação Digital 2025',
            municipality: { connect: { id: paulId } },
            department: depPaul.educacaoId ? { connect: { id: depPaul.educacaoId } } : undefined,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-08-31'),
            monthlyValue: 35000,
            status: 'ATIVO',
        },
    });
    const igaId = muniMap.get('Igarassu');
    const depIga = depMap.get('Igarassu');
    const ct3 = await prisma.contract.upsert({
        where: { municipalityId_code: { municipalityId: igaId, code: 'CT 010/2025' } },
        update: {
            description: 'Apoio à Rede Municipal de Saúde',
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-11-30'),
            monthlyValue: 28000,
            department: { connect: { id: depIga.saudeId } },
        },
        create: {
            code: 'CT 010/2025',
            description: 'Apoio à Rede Municipal de Saúde',
            municipality: { connect: { id: igaId } },
            department: { connect: { id: depIga.saudeId } },
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-11-30'),
            monthlyValue: 28000,
            status: 'ATIVO',
        },
    });
    return { ct1, ct2, ct3 };
}
async function ensureReceivable(input) {
    const existing = await prisma.receivable.findFirst({
        where: {
            OR: [
                input.noteNumber ? { noteNumber: input.noteNumber } : undefined,
                input.periodLabel ? { AND: [{ contractId: input.contractId }, { periodLabel: input.periodLabel }] } : undefined,
            ].filter(Boolean),
        },
    });
    if (existing)
        return existing;
    return prisma.receivable.create({
        data: {
            contract: { connect: { id: input.contractId } },
            noteNumber: input.noteNumber ?? null,
            issueDate: input.issueDate ?? null,
            grossAmount: input.grossAmount ?? null,
            netAmount: input.netAmount ?? null,
            periodLabel: input.periodLabel ?? null,
            periodStart: input.periodStart ?? null,
            periodEnd: input.periodEnd ?? null,
            deliveryDate: input.deliveryDate ?? null,
            receivedAt: input.receivedAt ?? null,
            status: input.status ?? 'A_RECEBER',
        },
    });
}
async function seedReceivables(contracts) {
    console.log('💸 Seeding receivables...');
    await ensureReceivable({
        contractId: contracts.ct1.id,
        noteNumber: 'NF-0001',
        issueDate: new Date('2025-03-01'),
        grossAmount: 50000,
        netAmount: 48000,
        periodLabel: 'FEV/2025',
        periodStart: new Date('2025-02-01'),
        periodEnd: new Date('2025-02-28'),
        deliveryDate: new Date('2025-03-05'),
        receivedAt: null,
        status: 'A_RECEBER',
    });
    await ensureReceivable({
        contractId: contracts.ct1.id,
        noteNumber: 'NF-0002',
        issueDate: new Date('2025-04-01'),
        grossAmount: 50000,
        netAmount: 48000,
        periodLabel: 'MAR/2025',
        periodStart: new Date('2025-03-01'),
        periodEnd: new Date('2025-03-31'),
        deliveryDate: new Date('2025-04-05'),
        receivedAt: new Date('2025-04-18'),
        status: 'RECEBIDO',
    });
    await ensureReceivable({
        contractId: contracts.ct2.id,
        noteNumber: 'NF-0100',
        issueDate: new Date('2025-03-10'),
        grossAmount: 35000,
        netAmount: 34000,
        periodLabel: 'FEV/2025',
        periodStart: new Date('2025-02-01'),
        periodEnd: new Date('2025-02-28'),
        deliveryDate: new Date('2025-03-12'),
        receivedAt: null,
        status: 'ATRASADO',
    });
    await ensureReceivable({
        contractId: contracts.ct3.id,
        noteNumber: 'NF-9001',
        issueDate: new Date('2025-05-05'),
        grossAmount: 28000,
        netAmount: 27500,
        periodLabel: 'ABR/2025',
        periodStart: new Date('2025-04-01'),
        periodEnd: new Date('2025-04-30'),
        deliveryDate: new Date('2025-05-08'),
        receivedAt: null,
        status: 'A_RECEBER',
    });
}
async function main() {
    console.log('🔄 Iniciando o seeding (municipalities/departments/contracts/receivables)...');
    await upsertUsers();
    const muniMap = await upsertMunicipalities();
    const depMap = await upsertDepartments(muniMap);
    const contracts = await upsertContracts(muniMap, depMap);
    await seedReceivables(contracts);
    console.log('✅ Seeding concluído com sucesso.');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map