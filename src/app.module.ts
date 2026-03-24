import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { WsgateExplorer } from '@wsgate/nest';
import { validate as configValidate } from './config/app.config';

@Module({
  imports: [
    DiscoveryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidate,
    }),
  ],
  providers: [WsgateExplorer],
})
export class AppModule {}
