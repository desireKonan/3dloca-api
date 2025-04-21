import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerConfig } from './utils/swagger';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  swaggerConfig(app);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      console.log('Allow Origins ====>', requestOrigin);
      // Autorisez uniquement certaines origines spécifiques
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      console.log('Allow Origins ====>', allowedOrigins);

      if (!requestOrigin || allowedOrigins.indexOf(requestOrigin) !== -1) {
        callback(null, true); // Autorise cette origine
      } else {
        callback(new Error('Not allowed by CORS')); // Bloque les autres origines
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type', 'Authorization', 'Origin', 'Accept'
    ],
    credentials: true,
    maxAge: 3600,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/',
    defaultVersion: 'v1',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
