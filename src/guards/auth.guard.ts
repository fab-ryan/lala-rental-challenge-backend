import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseService } from '@/utils';
import { Request, Response } from 'express';
// import { Observable } from 'rxjs';
import { AuthenticateMiddleware } from '@/middlewares';
import { ROLE_KEY } from '@/common';
import { RolesEnum as Role } from '@/enums';

export type AuthUserType = {
  id: string;
  role: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly responseServices: ResponseService,
    private authMiddleware: AuthenticateMiddleware,
    private reflector: Reflector,
  ) {}
  matchRoles(roles: Role[], userRole: Role) {
    return roles.some((role) => {
      return role === userRole;
    });
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authMiddleware.use(
      context.switchToHttp().getRequest<Request>(),
      context.switchToHttp().getResponse<Response>(),
      () => {},
    );
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      throw this.responseServices.Response({
        success: false,
        data: null,
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as unknown as AuthUserType;
    if (!user) {
      throw this.responseServices.Response({
        success: false,
        data: null,
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    if (!this.matchRoles(requiredRoles, user.role as Role)) {
      throw this.responseServices.Response({
        success: false,
        data: null,
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    return true;
  }
}
