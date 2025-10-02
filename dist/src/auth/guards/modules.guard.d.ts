import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class ModulesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(ctx: ExecutionContext): boolean;
}
