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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsPayableController = void 0;
const common_1 = require("@nestjs/common");
const accounts_payable_service_1 = require("./accounts-payable.service");
const create_accounts_payable_dto_1 = require("./dto/create-accounts-payable.dto");
const update_accounts_payable_dto_1 = require("./dto/update-accounts-payable.dto");
let AccountsPayableController = class AccountsPayableController {
    accountsPayableService;
    constructor(accountsPayableService) {
        this.accountsPayableService = accountsPayableService;
    }
    create(createAccountsPayableDto) {
        return this.accountsPayableService.create(createAccountsPayableDto);
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
    findOne(id) {
        return this.accountsPayableService.findOne(id);
    }
    update(id, updateAccountsPayableDto) {
        return this.accountsPayableService.update(id, updateAccountsPayableDto);
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