import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VAULT_PROCESS_QUEUE, VaultProcessJob } from './queue';
import { ExtractService } from './extract.service';
import { ProcessingStatus } from '@prisma/client';
import { readFile } from 'fs/promises';
import * as path from 'path';

@Processor(VAULT_PROCESS_QUEUE)
export class VaultQueueProcessor {
  private readonly log = new Logger(VaultQueueProcessor.name);

  constructor(
    private prisma: PrismaService,
    private extract: ExtractService,
  ) {}

  @Process()
  async handle(job: Job<VaultProcessJob>) {
    const { itemId, userId, kind } = job.data;
    this.log.log(`Processing ${kind} itemId=${itemId}`);

    await this.prisma.vaultItem.updateMany({
      where: { id: itemId, userId, status: { in: [ProcessingStatus.queued, ProcessingStatus.processing] } },
      data: { status: ProcessingStatus.processing, processingError: null },
    });

    const item = await this.prisma.vaultItem.findFirst({ where: { id: itemId, userId } });
    if (!item) {
      this.log.warn('Item not found');
      return;
    }

    try {
      if (kind === 'link' && item.url) {
        const r = await this.extract.extractFromUrl(item.url);
        const title = item.title === item.url || !item.title ? r.title : item.title;
        const body = r.description || item.body;
        await this.prisma.vaultItem.update({
          where: { id: itemId },
          data: {
            title,
            body,
            sourceHost: r.sourceHost,
            previewImageUrl: r.previewImageUrl,
            extractedText: r.extractedText,
            status: ProcessingStatus.done,
            processingError: null,
          },
        });
        return;
      }

      if (kind === 'file' && item.filePath && item.fileMime) {
        const full = path.isAbsolute(item.filePath)
          ? item.filePath
          : path.join(process.cwd(), item.filePath);
        const buf = await readFile(full);
        const text = await this.extract.extractTextFromFile(buf, item.fileMime);
        await this.prisma.vaultItem.update({
          where: { id: itemId },
          data: { extractedText: text, status: ProcessingStatus.done, processingError: null },
        });
        return;
      }

      await this.prisma.vaultItem.update({
        where: { id: itemId },
        data: { status: ProcessingStatus.done },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(`Failed itemId=${itemId} ${message}`);
      await this.prisma.vaultItem.update({
        where: { id: itemId },
        data: { status: ProcessingStatus.failed, processingError: message },
      });
    }
  }
}
