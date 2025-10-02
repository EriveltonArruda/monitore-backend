import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_MODULES_KEY } from '../decorators/require-modules.decorator';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(ctx: ExecutionContext): boolean {
    // módulos exigidos no handler ou controller
    const required: string[] =
      this.reflector.getAllAndOverride<string[]>(REQUIRE_MODULES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];

    // sem exigência => permitido
    if (required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // ADMIN passa sempre
    if (user.role === 'ADMIN') return true;

    const userModules: string[] = Array.isArray(user.modules) ? user.modules : [];
    // precisa ter pelo menos 1 módulo exigido
    return required.some((m) => userModules.includes(m));
  }
}
