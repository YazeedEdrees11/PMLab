import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global API prefix
  app.setGlobalPrefix('api');
  
  // Allow requests from frontend, mobile app, and any dev device
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 PMLab API running on http://localhost:${port}/api`);
}
bootstrap();
