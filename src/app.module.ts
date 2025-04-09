import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnoncesModule } from './annonces/annonces.module';

@Module({
  imports: [AnnoncesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
