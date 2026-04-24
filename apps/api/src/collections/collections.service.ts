import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  }

  async create(userId: string, name: string) {
    return this.prisma.collection.create({ data: { userId, name } });
  }

  async getOne(userId: string, id: string) {
    const c = await this.prisma.collection.findFirst({
      where: { id, userId },
      include: { items: { include: { item: { include: { tags: { include: { tag: true } } } } } } },
    });
    if (!c) throw new NotFoundException();
    return c;
  }

  async addItem(userId: string, collectionId: string, vaultItemId: string) {
    const col = await this.prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!col) throw new NotFoundException('Collection not found');
    const item = await this.prisma.vaultItem.findFirst({ where: { id: vaultItemId, userId } });
    if (!item) throw new NotFoundException('Item not found');
    try {
      await this.prisma.collectionItem.create({
        data: { collectionId, vaultItemId },
      });
    } catch (e) {
      throw new ConflictException('Item already in collection');
    }
    return this.getOne(userId, collectionId);
  }
}
