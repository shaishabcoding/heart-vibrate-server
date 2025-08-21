import { User as TUser } from '../../../../prisma';

export const userSearchableFields: (keyof TUser)[] = ['name', 'email', 'phone'];
