import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { setupApiDocs } from './common/config/api-docs.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import type { Env } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = app.get(ConfigService<Env, true>);

  setupApiDocs(app);

  //? Enable shutdown hooks to allow graceful shutdown of the application
  app.enableShutdownHooks();

  await app.listen(config.get('PORT', { infer: true }));

  Logger.log(`Application is running on: ${chalk.blue(await app.getUrl())}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  console.error('Error starting the application', err);
  process.exit(1);
});
