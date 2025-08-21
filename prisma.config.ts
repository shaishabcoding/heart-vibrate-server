import path from 'path';
import type { PrismaConfig } from 'prisma';
import './src/config/configure';

export default {
  schema: path.resolve('src/app/modules'),
} satisfies PrismaConfig;
