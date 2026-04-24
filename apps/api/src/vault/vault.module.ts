import { Module } from '@nestjs/common';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessorModule } from '../processor/processor.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, ProcessorModule, QueueModule],
  providers: [VaultService],
  controllers: [VaultController],
  exports: [VaultService],
})
export class VaultModule {}
