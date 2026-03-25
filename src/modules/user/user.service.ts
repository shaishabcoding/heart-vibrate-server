import { HttpException, Injectable } from '@nestjs/common';
import { hashPassword } from 'src/common/helpers';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser({ email, password }: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpException('Already have an account with this email', 400);
    }

    const { passwordHash, ...safeUser } = await this.userRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });

    return safeUser;
  }
}
