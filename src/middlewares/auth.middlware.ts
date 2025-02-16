import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { ResponseService } from '@/utils';

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException(
          this.responseService.Response({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
          }),
        );
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException(
          this.responseService.Response({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
          }),
        );
      }

      const user = await this.jwtService.verifyAsync(token, {
        secret: 'secret',
      });

      req.user = user as User;
    } catch (error) {
      throw new UnauthorizedException(
        this.responseService.Response({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    }
    next();
  }
}
interface User {
  id: string;
  iat: number;
  exp: number;
  readonly role: string;
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}
