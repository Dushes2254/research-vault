import { Module } from '@nestjs/common';
import { VaultQueueProcessor } from './vault-processor.service';
import { ExtractService } from './extract.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule],
  providers: [VaultQueueProcessor, ExtractService],
  exports: [ExtractService],
})
export class ProcessorModule {}
