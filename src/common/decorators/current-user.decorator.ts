import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { SafeUser, UnSafeUserFields } from '../types';

export const CurrentUser = createParamDecorator(
  <K extends keyof SafeUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): SafeUser | SafeUser[K] => {
    const user = ctx.switchToHttp().getRequest().user as User;

    const safeUser = Object.fromEntries(
      // biome-ignore lint/suspicious/noExplicitAny: We need to use `any` here to filter out the unsafe fields from the user object.
      Object.entries(user).filter(([key]) => !UnSafeUserFields.includes(key as any)),
    ) as SafeUser;

    return data ? safeUser[data] : safeUser;
  },
);
