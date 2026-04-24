import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Prisma, ProcessingStatus, VaultItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, UpdateItemDto } from './dto';
import { VAULT_PROCESS_QUEUE, VaultProcessJob } from '../processor/queue';
import * as path from 'path';
import { mkdir } from 'fs/promises';

@Injectable()
export class VaultService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(VAULT_PROCESS_QUEUE) private queue: Queue<VaultProcessJob>,
  ) {}

  private itemInclude = {
    tags: { include: { tag: true } },
    collections: { include: { collection: { select: { id: true, name: true } } } },
  } as const;

  async list(
    userId: string,
    q?: {
      search?: string;
      type?: VaultItemType;
      tagId?: string;
      collectionId?: string;
      includeArchived?: boolean;
    },
  ) {
    const where: Prisma.VaultItemWhereInput = { userId };
    if (!q?.includeArchived) where.archivedAt = null;
    if (q?.type) where.type = q.type;
    if (q?.tagId) where.tags = { some: { tagId: q.tagId } };
    if (q?.collectionId) where.collections = { some: { collectionId: q.collectionId } };
    if (q?.search?.trim()) {
      const s = q.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { body: { contains: s, mode: 'insensitive' } },
        { extractedText: { contains: s, mode: 'insensitive' } },
        { url: { contains: s, mode: 'insensitive' } },
      ];
    }
    return this.prisma.vaultItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: this.itemInclude,
    });
  }

  async getById(userId: string, id: string) {
    const item = await this.prisma.vaultItem.findFirst({
      where: { id, userId },
      include: this.itemInclude,
    });
    if (!item) throw new NotFoundException();
    return item;
  }

  async create(userId: string, dto: CreateItemDto) {
    const { tagNames, ...rest } = dto;
    const extractedText =
      rest.type === 'note' || rest.type === 'snippet' ? (rest.body ?? null) : null;
    const data: Prisma.VaultItemCreateInput = {
      user: { connect: { id: userId } },
      type: rest.type,
      title: rest.title,
      body: rest.body,
      url: rest.url,
      extractedText,
      status: this.initialStatus(rest.type, rest.url),
    };

    const item = await this.prisma.vaultItem.create({ data, include: this.itemInclude });
    if (tagNames?.length) await this.setTagsByNames(userId, item.id, tagNames);
    if (this.needsProcess(rest.type) && (rest.url || rest.type === 'file')) {
      await this.enqueue(userId, item.id, rest.type);
    }
    return this.getById(userId, item.id);
  }

  private initialStatus(type: VaultItemType, url?: string) {
    if (type === 'link' || type === 'video') return url ? ProcessingStatus.queued : ProcessingStatus.none;
    if (type === 'file') return ProcessingStatus.queued;
    if (type === 'note' || type === 'snippet') return ProcessingStatus.done;
    return ProcessingStatus.none;
  }

  private needsProcess(type: VaultItemType) {
    return type === 'link' || type === 'video' || type === 'file';
  }

  private async enqueue(userId: string, itemId: string, type: VaultItemType) {
    const kind: 'link' | 'file' = type === 'file' ? 'file' : 'link';
    await this.queue.add(
      { itemId, userId, kind } as VaultProcessJob,
      { removeOnComplete: 100, attempts: 2, backoff: { type: 'exponential', delay: 2000 } },
    );
  }

  async createFileItem(
    userId: string,
    file: Express.Multer.File,
    title?: string,
    tagNames?: string[],
  ) {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    await mkdir(uploadDir, { recursive: true });
    const ext = path.extname(file.originalname) || '';
    const safe = `${userId}-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    const filePath = path.join(uploadDir, safe);
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, file.buffer);
    const item = await this.prisma.vaultItem.create({
      data: {
        user: { connect: { id: userId } },
        type: 'file',
        title: title || file.originalname,
        fileName: file.originalname,
        filePath,
        fileMime: file.mimetype,
        fileSize: file.size,
        status: ProcessingStatus.queued,
      },
      include: this.itemInclude,
    });
    if (tagNames?.length) await this.setTagsByNames(userId, item.id, tagNames);
    await this.enqueue(userId, item.id, 'file');
    return this.getById(userId, item.id);
  }

  async update(userId: string, id: string, dto: UpdateItemDto) {
    const found = await this.prisma.vaultItem.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    return this.prisma.vaultItem.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        url: dto.url,
        aiSummary: dto.aiSummary,
      },
      include: this.itemInclude,
    });
  }

  async archive(userId: string, id: string, archive: boolean) {
    const found = await this.prisma.vaultItem.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    return this.prisma.vaultItem.update({
      where: { id },
      data: { archivedAt: archive ? new Date() : null },
      include: this.itemInclude,
    });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.vaultItem.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    await this.prisma.vaultItem.delete({ where: { id } });
    return { ok: true };
  }

  private async setTagsByNames(userId: string, itemId: string, names: string[]) {
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      const tag = await this.prisma.tag.upsert({
        where: { userId_name: { userId, name } },
        create: { userId, name },
        update: {},
      });
      await this.prisma.vaultItemTag
        .create({
          data: { vaultItemId: itemId, tagId: tag.id },
        })
        .catch(() => {
          // duplicate link
        });
    }
  }

  async addTag(userId: string, itemId: string, tagName: string) {
    await this.getById(userId, itemId);
    const name = tagName.trim();
    if (!name) return this.getById(userId, itemId);
    const tag = await this.prisma.tag.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name },
      update: {},
    });
    await this.prisma.vaultItemTag
      .create({ data: { vaultItemId: itemId, tagId: tag.id } })
      .catch(() => {
        // duplicate
      });
    return this.getById(userId, itemId);
  }

  async reprocess(userId: string, id: string) {
    const item = await this.getById(userId, id);
    if (item.type === 'file') {
      await this.prisma.vaultItem.update({
        where: { id },
        data: { status: ProcessingStatus.queued, processingError: null },
      });
      await this.enqueue(userId, id, 'file');
      return this.getById(userId, id);
    }
    if (item.type === 'link' || item.type === 'video') {
      if (!item.url) throw new ForbiddenException('No URL to process');
      await this.prisma.vaultItem.update({
        where: { id },
        data: { status: ProcessingStatus.queued, processingError: null },
      });
      await this.enqueue(userId, id, 'link');
      return this.getById(userId, id);
    }
    return item;
  }
}
