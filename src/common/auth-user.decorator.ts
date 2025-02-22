import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserType } from '@/guards/auth.guard';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUserType;
  },
);
