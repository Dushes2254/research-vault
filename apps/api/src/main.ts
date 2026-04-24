import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger, shouldEnableSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({ origin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  const swagger = shouldEnableSwagger();
  if (swagger) {
    setupSwagger(app);
  }
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API http://localhost:${port}`);
  if (swagger) {
    console.log(`Swagger UI http://localhost:${port}/docs`);
  }
}

bootstrap();
