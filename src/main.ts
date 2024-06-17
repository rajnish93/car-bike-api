import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as nocache from 'nocache';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { redirectMiddleware } from './utils/redirect.middleware';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appPrefix = configService.get('API_PREFIX');

  app.setGlobalPrefix(appPrefix);
  app.use(compression());
  app.use(helmet());
  app.use(nocache());

  const swaggerUrl = `${appPrefix}/docs`;
  const options = new DocumentBuilder()
    .setTitle('Cars & Bike Rental')
    .setDescription('Cars & Bike Rental API description')
    .setVersion('1.0')
    .addServer(appPrefix)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(swaggerUrl, app, document);

  app.use(redirectMiddleware('/', swaggerUrl));
  await app.listen(configService.get('PORT'));
}
bootstrap();
