import { TUser } from './User.interface';
import User from './User.model';
import { userSearchableFields } from './User.constant';
import QueryBuilder from '../../builder/QueryBuilder';

const createUser = async (user: Partial<TUser>) => await User.create(user);
const getAllUser = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  // const meta = await userQuery.countTotal();
  const users = await userQuery.modelQuery.exec();

  return {
    // meta,
    users,
  };
};

export const UserServices = {
  createUser,
  getAllUser,
};
