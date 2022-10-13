import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';

export const initialize = async (options?: NestApplicationOptions) => {
  const app = await NestFactory.create(AppModule, options);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('corsOrigin'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.setGlobalPrefix('api');

  return app;
};
