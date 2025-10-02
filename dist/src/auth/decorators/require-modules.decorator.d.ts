import { UserModule } from '../../users/dto/create-user.dto';
export declare const REQUIRE_MODULES_KEY = "requiredModules";
export declare const RequireModules: (...modules: UserModule[]) => import("@nestjs/common").CustomDecorator<string>;
