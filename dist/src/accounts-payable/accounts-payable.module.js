"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsPayableModule = void 0;
const common_1 = require("@nestjs/common");
const accounts_payable_service_1 = require("./accounts-payable.service");
const accounts_payable_controller_1 = require("./accounts-payable.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AccountsPayableModule = class AccountsPayableModule {
};
exports.AccountsPayableModule = AccountsPayableModule;
exports.AccountsPayableModule = AccountsPayableModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [accounts_payable_controller_1.AccountsPayableController],
        providers: [accounts_payable_service_1.AccountsPayableService],
    })
], AccountsPayableModule);
//# sourceMappingURL=accounts-payable.module.js.map