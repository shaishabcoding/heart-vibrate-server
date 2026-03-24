import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { WsgateExplorer } from '@wsgate/nest';
import { validate as configValidate } from './config/app.config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DiscoveryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidate,
    }),
    UserModule,
  ],
  providers: [WsgateExplorer],
})
export class AppModule {}
