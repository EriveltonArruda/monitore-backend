"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAccountsPayableDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_accounts_payable_dto_1 = require("./create-accounts-payable.dto");
class UpdateAccountsPayableDto extends (0, mapped_types_1.PartialType)(create_accounts_payable_dto_1.CreateAccountsPayableDto) {
}
exports.UpdateAccountsPayableDto = UpdateAccountsPayableDto;
//# sourceMappingURL=update-accounts-payable.dto.js.map