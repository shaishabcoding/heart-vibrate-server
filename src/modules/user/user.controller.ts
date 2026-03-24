import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser() user: User) {
    const { passwordHash, ...safeUser } = user;

    return safeUser;
  }
}
