import { PrismaClient } from '../../prisma';

const prisma = new PrismaClient();

export type TModels = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: any }
    ? K
    : never;
}[keyof PrismaClient];

export default prisma;
