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
exports.UpdateAccountsPayableDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_accounts_payable_dto_1 = require("./create-accounts-payable.dto");
const class_validator_1 = require("class-validator");
class UpdateAccountsPayableDto extends (0, mapped_types_1.PartialType)(create_accounts_payable_dto_1.CreateAccountsPayableDto) {
    installments;
    currentInstallment;
    isRecurring;
    recurringUntil;
}
exports.UpdateAccountsPayableDto = UpdateAccountsPayableDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAccountsPayableDto.prototype, "installments", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAccountsPayableDto.prototype, "currentInstallment", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAccountsPayableDto.prototype, "isRecurring", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateAccountsPayableDto.prototype, "recurringUntil", void 0);
//# sourceMappingURL=update-accounts-payable.dto.js.map