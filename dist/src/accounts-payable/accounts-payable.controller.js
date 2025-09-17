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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsPayableController = void 0;
const common_1 = require("@nestjs/common");
const accounts_payable_service_1 = require("./accounts-payable.service");
const create_accounts_payable_dto_1 = require("./dto/create-accounts-payable.dto");
const update_accounts_payable_dto_1 = require("./dto/update-accounts-payable.dto");
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = require("path");
const get_payables_status_dto_1 = require("./dto/get-payables-status.dto");
let AccountsPayableController = class AccountsPayableController {
    accountsPayableService;
    constructor(accountsPayableService) {
        this.accountsPayableService = accountsPayableService;
    }
    create(dto) {
        return this.accountsPayableService.create(dto);
    }
    findAll(page, limit, month, year, status, category, search) {
        return this.accountsPayableService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            month: month ? Number(month) : undefined,
            year: year ? Number(year) : undefined,
            status: status && status !== 'TODOS' ? status : undefined,
            category: category && category !== 'TODAS' ? category : undefined,
            search: search || '',
        });
    }
    getSummary(from, to, status, category, search) {
        return this.accountsPayableService.getSummary({ from, to, status, category, search });
    }
    getPayablesStatus(query) {
        return this.accountsPayableService.getPayablesStatus(query);
    }
    async getMonthlyReport(year, category, status, page, limit) {
        return this.accountsPayableService.getMonthlyReport(year, category, status, Number(page) || 1, Number(limit) || 12);
    }
    async exportListPdf(res, month, year, status, category, search) {
        const { data: accounts } = await this.accountsPayableService.findAll({
            page: 1,
            limit: 100000,
            month: month ? Number(month) : undefined,
            year: year ? Number(year) : undefined,
            status: status && status !== 'TODOS' ? status : undefined,
            category: category && category !== 'TODAS' ? category : undefined,
            search: search || '',
        });
        const fonts = {
            Roboto: {
                normal: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
                bold: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
                italics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
                bolditalics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf'),
            },
        };
        const printer = new pdfmake_1.default(fonts);
        const brl = (n) => `R$ ${Number(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const fdate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
        const installmentLabel = (acc) => acc.installmentType === 'PARCELADO' && acc.installments && acc.currentInstallment
            ? `${acc.currentInstallment}/${acc.installments}`
            : 'Única';
        const tableBody = [
            [
                { text: 'Nome', style: 'tableHeader' },
                { text: 'Categoria', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader' },
                { text: 'Vencimento', style: 'tableHeader' },
                { text: 'Status', style: 'tableHeader' },
                { text: 'Parcela', style: 'tableHeader' },
            ],
            ...accounts.map((a) => [
                a.name ?? '-',
                a.category ?? '-',
                brl(a.value),
                fdate(a.dueDate),
                a.status ?? '-',
                installmentLabel(a),
            ]),
        ];
        const filtersLine = [
            month ? `Mês: ${month}` : 'Mês: Todos',
            year ? `Ano: ${year}` : 'Ano: Todos',
            status && status !== 'TODOS' ? `Status: ${status}` : 'Status: Todos',
            category && category !== 'TODAS' ? `Categoria: ${category}` : 'Categoria: Todas',
            search ? `Busca: "${search}"` : '',
        ]
            .filter(Boolean)
            .join(' | ');
        const docDefinition = {
            content: [
                { text: 'Relatório - Contas a Pagar', style: 'header', margin: [0, 0, 0, 6] },
                { text: filtersLine, fontSize: 9, margin: [0, 0, 0, 10] },
                {
                    table: { headerRows: 1, widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'], body: tableBody },
                    layout: 'lightHorizontalLines',
                },
                {
                    text: `\nGerado em ${new Date().toLocaleString('pt-BR')}`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 10, 0, 0],
                },
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                tableHeader: { bold: true, fillColor: '#eeeeee' },
            },
            defaultStyle: { font: 'Roboto' },
            pageMargins: [20, 30, 20, 30],
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
        pdfDoc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="relatorio-contas-a-pagar.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        });
        pdfDoc.end();
    }
    async exportOnePdf(id, res) {
        const account = await this.accountsPayableService.findOne(id);
        const fonts = {
            Roboto: {
                normal: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
                bold: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
                italics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
                bolditalics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf'),
            },
        };
        const printer = new pdfmake_1.default(fonts);
        const brl = (n) => `R$ ${Number(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const fdate = (d) => (d ? new Date(d).toLocaleString('pt-BR') : '-');
        const parcela = account.installmentType === 'PARCELADO' && account.installments && account.currentInstallment
            ? `${account.currentInstallment}/${account.installments}`
            : 'Única';
        const details = [
            [{ text: 'Nome', bold: true }, account.name ?? '-'],
            [{ text: 'Categoria', bold: true }, account.category ?? '-'],
            [{ text: 'Valor', bold: true }, brl(account.value)],
            [{ text: 'Vencimento', bold: true }, fdate(account.dueDate)],
            [{ text: 'Status', bold: true }, account.status ?? '-'],
            [{ text: 'Parcela', bold: true }, parcela],
            [{ text: 'Criado em', bold: true }, fdate(account.createdAt)],
            [{ text: 'Atualizado em', bold: true }, fdate(account.updatedAt)],
        ];
        const paymentsBody = [
            [
                { text: 'Data de Pagamento', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader' },
                { text: 'Conta Bancária', style: 'tableHeader' },
            ],
            ...(Array.isArray(account.payments) && account.payments.length > 0
                ? account.payments.map((p) => [
                    fdate(p.paidAt),
                    p.amount != null ? brl(p.amount) : '-',
                    p.bankAccount ?? '-',
                ])
                : [[{ text: 'Sem pagamentos registrados', colSpan: 3, italics: true }, {}, {}]]),
        ];
        const docDefinition = {
            content: [
                { text: 'Conta a Pagar - Detalhes', style: 'header', margin: [0, 0, 0, 10] },
                {
                    table: { widths: ['auto', '*'], body: details },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 14],
                },
                { text: 'Pagamentos', style: 'subheader', margin: [0, 0, 0, 6] },
                {
                    table: { headerRows: 1, widths: ['auto', 'auto', '*'], body: paymentsBody },
                    layout: 'lightHorizontalLines',
                },
                {
                    text: `\nGerado em ${new Date().toLocaleString('pt-BR')}`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 10, 0, 0],
                },
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                subheader: { fontSize: 12, bold: true },
                tableHeader: { bold: true, fillColor: '#eeeeee' },
            },
            defaultStyle: { font: 'Roboto' },
            pageMargins: [20, 30, 20, 30],
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
        pdfDoc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="conta-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        });
        pdfDoc.end();
    }
    findOne(id) {
        return this.accountsPayableService.findOne(id);
    }
    update(id, dto) {
        return this.accountsPayableService.update(id, dto);
    }
    remove(id) {
        return this.accountsPayableService.remove(id);
    }
};
exports.AccountsPayableController = AccountsPayableController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_accounts_payable_dto_1.CreateAccountsPayableDto]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('category')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('reports/status'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_payables_status_dto_1.GetPayablesStatusQueryDto]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "getPayablesStatus", null);
__decorate([
    (0, common_1.Get)('reports/month'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsPayableController.prototype, "getMonthlyReport", null);
__decorate([
    (0, common_1.Get)('export-pdf'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsPayableController.prototype, "exportListPdf", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AccountsPayableController.prototype, "exportOnePdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_accounts_payable_dto_1.UpdateAccountsPayableDto]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AccountsPayableController.prototype, "remove", null);
exports.AccountsPayableController = AccountsPayableController = __decorate([
    (0, common_1.Controller)('accounts-payable'),
    __metadata("design:paramtypes", [accounts_payable_service_1.AccountsPayableService])
], AccountsPayableController);
//# sourceMappingURL=accounts-payable.controller.js.map