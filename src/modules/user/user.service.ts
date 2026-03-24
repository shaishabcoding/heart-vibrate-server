import { Injectable } from '@nestjs/common';
import type { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(readonly _userRepository: UserRepository) {}
}
