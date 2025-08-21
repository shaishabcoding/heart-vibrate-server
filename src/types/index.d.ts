import { User as TUser } from '../../prisma';

declare global {
  namespace Express {
    interface Request {
      user: TUser;
      tempFiles: string[];
    }
  }
}
