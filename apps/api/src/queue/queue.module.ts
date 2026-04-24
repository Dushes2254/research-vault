import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VAULT_PROCESS_QUEUE } from '../processor/queue';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: VAULT_PROCESS_QUEUE })],
  exports: [BullModule],
})
export class QueueModule {}
