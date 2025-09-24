"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfeImportsModule = void 0;
const common_1 = require("@nestjs/common");
const nfe_imports_service_1 = require("./nfe-imports.service");
const nfe_imports_controller_1 = require("./nfe-imports.controller");
const prisma_service_1 = require("../prisma/prisma.service");
let NfeImportsModule = class NfeImportsModule {
};
exports.NfeImportsModule = NfeImportsModule;
exports.NfeImportsModule = NfeImportsModule = __decorate([
    (0, common_1.Module)({
        controllers: [nfe_imports_controller_1.NfeImportsController],
        providers: [nfe_imports_service_1.NfeImportsService, prisma_service_1.PrismaService],
    })
], NfeImportsModule);
//# sourceMappingURL=nfe-imports.module.js.map