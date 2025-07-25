import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, ctx.getHandler());
    if (!requiredRoles) return true;

    const req = ctx.switchToHttp().getRequest();
    const userRoles: string[] = req.roles || [];
    // Verifica si el usuario tiene al menos uno de los roles requeridos en cualquier propiedad de rolesId
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
