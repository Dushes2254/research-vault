import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger UI: GET /docs
 * Включается если:
 * - SWAGGER_ENABLED=1, или
 * - NODE_ENV !== production и SWAGGER_ENABLED !== 0
 */
export function shouldEnableSwagger(): boolean {
  if (process.env.SWAGGER_ENABLED === '1') return true;
  if (process.env.SWAGGER_ENABLED === '0') return false;
  return process.env.NODE_ENV !== 'production';
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Research Vault API')
    .setDescription(
      [
        'Личный knowledge hub: материалы (ссылки, заметки, файлы), теги, коллекции, поиск, фоновая обработка, AI (при наличии `OPENAI_API_KEY`).',
        '',
        '**Авторизация:** получите `accessToken` через `POST /auth/login` или `POST /auth/register`, затем нажмите **Authorize** и вставьте токен (без префикса `Bearer ` сгенерируется автоматически).',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT из ответа login/register',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
    customSiteTitle: 'Research Vault API',
  });
}
