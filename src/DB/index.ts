import colors from 'colors';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import User from '../app/modules/user/User.model';
import { TUser } from '../app/modules/user/User.interface';

const superUser: TUser = {
  name: { firstName: 'super', lastName: 'admin' },
  gender: 'male',
  role: 'ADMIN',
  email: config.admin.email as string,
  password: config.admin.password as string,
  avatar: 'https://i.ibb.co.com/Lk37HMB/download.jpg',
};

const seedAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: USER_ROLES.ADMIN,
  });

  if (!isExistSuperAdmin) {
    await User.create(superUser);
    logger.info(colors.green('✔admin created successfully!'));
  }
};

export default seedAdmin;
