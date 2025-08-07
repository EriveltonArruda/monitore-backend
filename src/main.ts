import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // *** USE process.cwd() para servir estáticos ***
  const staticPath = join(process.cwd(), 'uploads');
  console.log('>>> Servindo arquivos estáticos de:', staticPath);
  app.useStaticAssets(staticPath, {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
