import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { WsgateModule } from '@wsgate/nest';

// biome-ignore lint/suspicious/noExplicitAny: Interface from NestJS
export async function setupApiDocs(app: INestApplication<any>) {
  //? Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Heart Vibrate API')
    .setDescription(
      `Heart Vibrate is a chat application built with NestJS, Prisma, and Zod. It provides real-time messaging capabilities and a robust API for managing users, conversations, and messages.`,
    )
    .setVersion(process.env.npm_package_version ?? '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerUiEnabled: false, //? Disable Swagger UI since we're using Scalar UI
  });

  // Scalar UI at /docs
  app.use(
    '/docs',
    apiReference({
      content: document,
      layout: 'modern',
      theme: 'kepler',
      hideClientButton: true,
      showOperationId: true,
      showSidebar: true,
      showDeveloperTools: 'never',
      showToolbar: 'localhost',
      operationTitleSource: 'summary',
      persistAuth: true,
      telemetry: true,
      isEditable: false,
      isLoading: false,
      documentDownloadType: 'both',
      hideSearch: false,
      withDefaultFonts: true,
      defaultOpenFirstTag: true,
      defaultOpenAllTags: true,
      expandAllModelSections: false,
      expandAllResponses: false,
      orderSchemaPropertiesBy: 'alpha',
      orderRequiredPropertiesFirst: true,
      _integration: 'nestjs',
      default: false,
    }),
  );

  //? WebSocket docs at /ws-docs
  await WsgateModule.setup('/ws-docs', app, { title: 'Heart Vibrate WebSocket' });
}
