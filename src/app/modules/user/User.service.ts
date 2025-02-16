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

  const total = await User.countDocuments();
  const users = await userQuery.modelQuery.exec();

  return {
    meta: {
      total,
    },
    users,
  };
};

const userList = async (name: string) => {
  const users = await User.find({
    $or: [
      { 'name.firstName': new RegExp(name, 'i') },
      { 'name.lastName': new RegExp(name, 'i') },
    ],
  }).select('_id avatar name');

  return users;
};

export const UserServices = {
  createUser,
  getAllUser,
  userList,
};
