import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/HttpExceptionHandler';
import { ValidationExceptionFilter } from './common/validationErrorHandler';
declare const module: any;
async function bootstrap() {
  const app = (await NestFactory.create(AppModule));
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalFilters(new ValidationExceptionFilter())
  const config=new DocumentBuilder()
  .setTitle('e-commerce')
  .setDescription('app for buying online')
  .addBearerAuth()
  .addTag('e-commerce')
  .build()
  const doc=SwaggerModule.createDocument(app,config)
  SwaggerModule.setup('docs',app,doc)
  await app.listen(4000);

}
bootstrap();
