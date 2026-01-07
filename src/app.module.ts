import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilematcherController } from './filematcher/filematcher.controller';
import { FilematcherModule } from './filematcher/filematcher.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FilematcherModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, FilematcherController],
  providers: [AppService],
})
export class AppModule {}
