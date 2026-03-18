import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate as configValidate } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidate,
    }),
  ],
})
export class AppModule {}
