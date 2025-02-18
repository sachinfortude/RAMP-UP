import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter()); // Apply Global Exception Filter
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server ready at http://localhost:3000`);
  });
}
bootstrap();
