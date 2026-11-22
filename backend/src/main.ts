import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './comum/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Libera o frontend (Next.js) para chamar a API.
  // Em produção, defina FRONTEND_URL com a URL do site (várias separadas por vírgula).
  app.enableCors({ origin: process.env.FRONTEND_URL?.split(',') ?? true });

  // Converte erros do Prisma (registro duplicado, não encontrado...) em respostas HTTP.
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Porta 3001: o frontend roda na 3000 e já aponta para a API em localhost:3001.
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
