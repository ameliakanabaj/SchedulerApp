import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 8083; 

  await app.listen(PORT, '0.0.0.0'); 
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
