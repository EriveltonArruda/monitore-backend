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
exports.CreateUserDto = exports.UserModule = exports.UserRole = void 0;
const class_validator_1 = require("class-validator");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["USER"] = "USER";
    UserRole["MANAGER"] = "MANAGER";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserModule;
(function (UserModule) {
    UserModule["CONTAS_PAGAR"] = "CONTAS_PAGAR";
    UserModule["RELATORIO_CONTAS_PAGAR"] = "RELATORIO_CONTAS_PAGAR";
    UserModule["ESTOQUE"] = "ESTOQUE";
    UserModule["MOVIMENTACOES"] = "MOVIMENTACOES";
    UserModule["RELATORIOS"] = "RELATORIOS";
    UserModule["FORNECEDORES"] = "FORNECEDORES";
    UserModule["CATEGORIAS"] = "CATEGORIAS";
    UserModule["DASHBOARD"] = "DASHBOARD";
    UserModule["CONTATOS"] = "CONTATOS";
    UserModule["USUARIOS"] = "USUARIOS";
    UserModule["DESPESAS_VIAGEM"] = "DESPESAS_VIAGEM";
    UserModule["MUNICIPIOS"] = "MUNICIPIOS";
    UserModule["ORGAOS_SECRETARIAS"] = "ORGAOS_SECRETARIAS";
    UserModule["CONTRATOS"] = "CONTRATOS";
    UserModule["RECEBIVEIS"] = "RECEBIVEIS";
})(UserModule || (exports.UserModule = UserModule = {}));
class CreateUserDto {
    name;
    email;
    password;
    role;
    modules;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome não pode estar vazio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Por favor, insira um e-mail válido.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(UserRole)),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(Object.values(UserModule), { each: true }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "modules", void 0);
//# sourceMappingURL=create-user.dto.js.map