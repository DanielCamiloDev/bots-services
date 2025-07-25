import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se encontró el token');
    }
    const token = authHeader.split(' ')[1];
    try {
      // Decodifica el JWT sin verificar la firma
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.rrhh || !decoded.rrhh.name) {
        throw new UnauthorizedException('Token inválido: falta rrhh.name');
      }
      // Adjunta el nombre y los roles extraídos al request
      (request as any).userName = decoded.rrhh.name;
      (request as any).userRoles = decoded.rolesId || {};
      (request as any).roles = decoded.roles || [];
      (request as any).rrhh = decoded.rrhh_id;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}