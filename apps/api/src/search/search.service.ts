import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, VaultItemType } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Full-text style search: OR contains across title, body, extractedText, url
   */
  search(userId: string, q: string, type?: VaultItemType) {
    const s = q.trim();
    if (!s) return [];
    const where: Prisma.VaultItemWhereInput = {
      userId,
      archivedAt: null,
      ...(type ? { type } : {}),
      OR: [
        { title: { contains: s, mode: 'insensitive' } },
        { body: { contains: s, mode: 'insensitive' } },
        { extractedText: { contains: s, mode: 'insensitive' } },
        { url: { contains: s, mode: 'insensitive' } },
      ],
    };
    return this.prisma.vaultItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { tags: { include: { tag: true } } },
    });
  }
}
