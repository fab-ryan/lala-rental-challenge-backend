import { NestFactory, Reflector } from '@nestjs/core';
import { config } from 'dotenv';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';


import { Logger} from '@/utils'
import { swaggerConfig, config as configEnv, }
 from '@/config'
import { AppModule } from './app.module';
import { HttpExceptionFilter, QueryFailedFilter } from './common';


config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger:Logger.logger,
    cors:true
  });
  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: false,
      xssFilter: true,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalFilters(
    new QueryFailedFilter(reflector),
    new HttpExceptionFilter(reflector),
  );

  app.setGlobalPrefix(configEnv().prefix);


  const swaggerDocument = new DocumentBuilder()
  .setTitle(swaggerConfig.title)
  .setDescription(swaggerConfig.description)
  .setVersion(swaggerConfig.version)
  .setTermsOfService(swaggerConfig.termsOfService)
  .setContact(swaggerConfig.contactName, swaggerConfig.contactUrl, swaggerConfig.contactEmail)
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })
  .build();
const document = SwaggerModule.createDocument(app, swaggerDocument);
SwaggerModule.setup('docs', app, document);
await app.listen(configEnv().port);
}
bootstrap();
