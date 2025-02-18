import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter()); // Apply Global Exception Filter
  await app.listen(3001, () => {
    console.log(`Server ready at http://localhost:3001`);
  });
}
bootstrap();
