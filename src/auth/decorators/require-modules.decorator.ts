import { SetMetadata } from '@nestjs/common';
import { UserModule } from '../../users/dto/create-user.dto';

export const REQUIRE_MODULES_KEY = 'requiredModules';

/**
 * Exige que o usuário possua PELO MENOS um dos módulos informados.
 * Admin sempre passa.
 */
export const RequireModules = (...modules: UserModule[]) =>
  SetMetadata(REQUIRE_MODULES_KEY, modules);
