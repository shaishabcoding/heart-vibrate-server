import { TUser } from '../app/modules/user/User.interface';

declare global {
  namespace Express {
    interface Request {
      user: TUser;
    }
  }
}
