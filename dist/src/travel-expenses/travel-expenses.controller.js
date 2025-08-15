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
exports.TravelExpensesController = void 0;
const common_1 = require("@nestjs/common");
const travel_expenses_service_1 = require("./travel-expenses.service");
const create_travel_expense_dto_1 = require("./dto/create-travel-expense.dto");
const update_travel_expense_dto_1 = require("./dto/update-travel-expense.dto");
const create_reimbursement_dto_1 = require("./dto/create-reimbursement.dto");
let TravelExpensesController = class TravelExpensesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll(page, pageSize, month, year, status, category, search) {
        return this.service.findAll({
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            month: month ? Number(month) : undefined,
            year: year ? Number(year) : undefined,
            status,
            category,
            search,
        });
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
    listReimbursements(id) {
        return this.service.listReimbursements(id);
    }
    addReimbursement(id, dto) {
        return this.service.addReimbursement(id, dto);
    }
    deleteReimbursement(id, reimbursementId) {
        return this.service.deleteReimbursement(id, reimbursementId);
    }
    listAdvances(id) {
        return this.service.listAdvances(id);
    }
    addAdvance(id, dto) {
        return this.service.addAdvance(id, dto);
    }
    deleteAdvance(id, advanceId) {
        return this.service.deleteAdvance(id, advanceId);
    }
    listReturns(id) {
        return this.service.listReturns(id);
    }
    addReturn(id, dto) {
        return this.service.addReturn(id, dto);
    }
    deleteReturn(id, returnId) {
        return this.service.deleteReturn(id, returnId);
    }
};
exports.TravelExpensesController = TravelExpensesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_travel_expense_dto_1.CreateTravelExpenseDto]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('category')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_travel_expense_dto_1.UpdateTravelExpenseDto]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/reimbursements'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "listReimbursements", null);
__decorate([
    (0, common_1.Post)(':id/reimbursements'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_reimbursement_dto_1.CreateReimbursementDto]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "addReimbursement", null);
__decorate([
    (0, common_1.Delete)(':id/reimbursements/:reimbursementId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('reimbursementId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "deleteReimbursement", null);
__decorate([
    (0, common_1.Get)(':id/advances'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "listAdvances", null);
__decorate([
    (0, common_1.Post)(':id/advances'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "addAdvance", null);
__decorate([
    (0, common_1.Delete)(':id/advances/:advanceId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('advanceId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "deleteAdvance", null);
__decorate([
    (0, common_1.Get)(':id/returns'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "listReturns", null);
__decorate([
    (0, common_1.Post)(':id/returns'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "addReturn", null);
__decorate([
    (0, common_1.Delete)(':id/returns/:returnId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('returnId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TravelExpensesController.prototype, "deleteReturn", null);
exports.TravelExpensesController = TravelExpensesController = __decorate([
    (0, common_1.Controller)('travel-expenses'),
    __metadata("design:paramtypes", [travel_expenses_service_1.TravelExpensesService])
], TravelExpensesController);
//# sourceMappingURL=travel-expenses.controller.js.map