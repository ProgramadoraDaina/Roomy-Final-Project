import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AccessTokenPayload } from '../auth.types';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  return ctx.switchToHttp().getRequest().user;
});
