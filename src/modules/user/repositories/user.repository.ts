import { Injectable } from '@nestjs/common';
import type { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(readonly _prisma: PrismaService) {}
}
