import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Zod validation
  app.useGlobalPipes(new ZodValidationPipe());

  // ─── Swagger (REST) ───────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('REST API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDoc);

  // ─── AsyncAPI (WebSocket) ─────────────────────
  const asyncApiConfig = new AsyncApiDocumentBuilder()
    .setTitle('Chat WebSocket API')
    .setDescription('Socket.IO event docs')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('chat-server', {
      url: 'ws://localhost:3000',
      protocol: 'socket.io',
    })
    .build();

  const asyncApiDoc = AsyncApiModule.createDocument(app, asyncApiConfig);
  await AsyncApiModule.setup('/async-api', app, asyncApiDoc);

  await app.listen(3000);

  console.log('REST Docs   → http://localhost:3000/api-docs');
  console.log('Socket Docs → http://localhost:3000/async-api');
}

bootstrap();
