import colors from 'colors';
import { errorLogger } from '../../../util/logger/logger';
import { logger } from '../../../util/logger/logger';
import config from '../../../config';
import prisma from '../../../util/prisma';
import { EUserRole } from '../../../../prisma';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const { name, email, password } = config.admin;

    try {
      const admin = await prisma.user.findFirst({
        where: { email },
      });

      if (admin?.role === EUserRole.ADMIN) return;

      logger.info(colors.green('🔑 admin creation started...'));

      await prisma.user.upsert({
        where: { email },
        update: { role: EUserRole.ADMIN },
        create: {
          name,
          email,
          role: EUserRole.ADMIN,
          Auth: {
            create: {
              password: await password?.hash(),
            },
          },
        },
      });

      logger.info(colors.green('✔ admin created successfully!'));
    } catch (error) {
      errorLogger.error(colors.red('❌ admin creation failed!'), error);
    }
  },
};
