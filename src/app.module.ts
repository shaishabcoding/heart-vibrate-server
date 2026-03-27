import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { WsgateExplorer } from '@wsgate/nest';
import { validate as configValidate } from './config/app.config';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DiscoveryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidate,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    ChatModule,
    MessageModule,
    UploadModule,
  ],
  providers: [WsgateExplorer],
})
export class AppModule {}
