"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const categories_module_1 = require("./categories/categories.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const products_module_1 = require("./products/products.module");
const stock_movements_module_1 = require("./stock-movements/stock-movements.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const reports_module_1 = require("./reports/reports.module");
const contacts_module_1 = require("./contacts/contacts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [categories_module_1.CategoriesModule, suppliers_module_1.SuppliersModule, products_module_1.ProductsModule, stock_movements_module_1.StockMovementsModule, dashboard_module_1.DashboardModule, reports_module_1.ReportsModule, contacts_module_1.ContactsModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map