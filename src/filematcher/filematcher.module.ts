import { Module } from '@nestjs/common';
import { FilematcherService } from './filematcher.service';
import { FilematcherController } from './filematcher.controller';
import { HybridOcrService } from 'src/hybrid-ocr/hybrid-ocr.service';

@Module({
  controllers: [FilematcherController],
  providers: [FilematcherService, HybridOcrService],
  exports: [FilematcherService, HybridOcrService]
})
export class FilematcherModule {}
