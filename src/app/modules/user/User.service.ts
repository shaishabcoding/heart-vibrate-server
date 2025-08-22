import { TList } from '../query/Query.interface';
import { userSearchableFields as searchFields } from './User.constant';
import { deleteImage } from '../../middlewares/capture';
import prisma from '../../../util/prisma';
import { Auth as TAuth, User as TUser } from '../../../../prisma';
import { TPagination } from '../../../util/server/serveResponse';

export const UserServices = {
  async create({ password, ...userData }: TUser & TAuth) {
    return prisma.user.create({
      data: {
        ...userData,
        Auth: { create: { password: await password?.hash() } },
      },
    });
  },

  async updateUser({
    user,
    body,
  }: {
    user: Partial<TUser>;
    body: Partial<TUser>;
  }) {
    if (body.avatar) user?.avatar?.__pipes(deleteImage);

    return prisma.user.update({ where: { id: user.id }, data: body });
  },

  async getAllUser({ page, limit, search, ...where }: TUser & TList) {
    where ??= {} as any;

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async getUsersCount() {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    return Object.fromEntries(
      counts.map(({ role, _count }) => [role, _count._all]),
    );
  },

  async delete(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    user?.avatar?.__pipes(deleteImage); // delete avatar

    return prisma.user.delete({ where: { id: userId } });
  },
};
