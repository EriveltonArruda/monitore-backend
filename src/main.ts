import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Habilita o CORS.
  // Isso adiciona os cabeçalhos necessários nas respostas da API
  // para que o navegador permita que o seu frontend (em outra "origem")
  // se comunique com este backend.
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
