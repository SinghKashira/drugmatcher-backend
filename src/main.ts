import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.enableCors();
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:8100', // Ionic
      'https://your-frontend.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
