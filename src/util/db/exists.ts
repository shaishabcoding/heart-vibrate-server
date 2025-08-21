import prisma, { TModels } from '../prisma';

export const exists =
  (model: TModels) =>
  async (id: string | null = null) =>
    id && (await (prisma[model] as any).findUnique({ where: { id } }));
