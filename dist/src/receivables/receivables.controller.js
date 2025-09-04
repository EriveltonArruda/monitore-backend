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
exports.ReceivablesController = void 0;
const common_1 = require("@nestjs/common");
const receivables_service_1 = require("./receivables.service");
const create_receivable_dto_1 = require("./dto/create-receivable.dto");
const update_receivable_dto_1 = require("./dto/update-receivable.dto");
const find_receivables_dto_1 = require("./dto/find-receivables.dto");
let ReceivablesController = class ReceivablesController {
    receivablesService;
    constructor(receivablesService) {
        this.receivablesService = receivablesService;
    }
    create(dto) {
        return this.receivablesService.create(dto);
    }
    findAll(query) {
        return this.receivablesService.findAll(query);
    }
    findOne(id) {
        return this.receivablesService.findOne(id);
    }
    update(id, dto) {
        return this.receivablesService.update(id, dto);
    }
    remove(id) {
        return this.receivablesService.remove(id);
    }
};
exports.ReceivablesController = ReceivablesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_receivable_dto_1.CreateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_receivables_dto_1.FindReceivablesDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_receivable_dto_1.UpdateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "remove", null);
exports.ReceivablesController = ReceivablesController = __decorate([
    (0, common_1.Controller)('receivables'),
    __metadata("design:paramtypes", [receivables_service_1.ReceivablesService])
], ReceivablesController);
//# sourceMappingURL=receivables.controller.js.map