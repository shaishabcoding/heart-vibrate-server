import { User } from '@prisma/client';

export const UnSafeUserFields = ['passwordHash'] as const satisfies ReadonlyArray<keyof User>;
export type UnSafeUserField = (typeof UnSafeUserFields)[number];
export type SafeUser = Omit<User, UnSafeUserField>;
