"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireModules = exports.REQUIRE_MODULES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_MODULES_KEY = 'requiredModules';
const RequireModules = (...modules) => (0, common_1.SetMetadata)(exports.REQUIRE_MODULES_KEY, modules);
exports.RequireModules = RequireModules;
//# sourceMappingURL=require-modules.decorator.js.map