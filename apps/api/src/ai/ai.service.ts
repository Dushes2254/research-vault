import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private client: OpenAI | null = null;

  constructor(private prisma: PrismaService) {
    const key = process.env.OPENAI_API_KEY;
    if (key) this.client = new OpenAI({ apiKey: key });
  }

  private model() {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private ensureClient() {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY is not configured. Set it in apps/api/.env to enable AI features.',
      );
    }
  }

  async summary(userId: string, itemId: string) {
    this.ensureClient();
    const item = await this.prisma.vaultItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new BadRequestException('Item not found');
    const text = [item.title, item.body, item.extractedText].filter(Boolean).join('\n\n');
    const completion = await this.client!.chat.completions.create({
      model: this.model(),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Summarize the following research material in 5-8 bullet points. Be concise. Use the same language as the source when possible.',
        },
        { role: 'user', content: text.slice(0, 120_000) },
      ],
      temperature: 0.3,
    });
    const summary = completion.choices[0]?.message?.content?.trim() || '';
    await this.prisma.vaultItem.update({ where: { id: itemId }, data: { aiSummary: summary } });
    return { summary };
  }

  async suggestTags(userId: string, itemId: string) {
    this.ensureClient();
    const item = await this.prisma.vaultItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new BadRequestException('Item not found');
    const text = [item.title, item.body, item.extractedText].filter(Boolean).join('\n\n');
    const completion = await this.client!.chat.completions.create({
      model: this.model(),
      messages: [
        {
          role: 'system',
          content:
            'Return 5-12 short tags for the content, comma-separated, lowercase, single words or kebab-case if needed. No quotes, no numbering.',
        },
        { role: 'user', content: text.slice(0, 8000) },
      ],
      temperature: 0.2,
    });
    const raw = completion.choices[0]?.message?.content || '';
    const tags = raw
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
    return { tags };
  }

  async ask(userId: string, itemIds: string[], question: string) {
    this.ensureClient();
    if (!itemIds.length) throw new BadRequestException('itemIds required');
    const items = await this.prisma.vaultItem.findMany({
      where: { userId, id: { in: itemIds } },
    });
    if (items.length !== itemIds.length) throw new BadRequestException('Some items not found');
    const ctx = items
      .map(
        (i: (typeof items)[number]) =>
          `### ${i.title}\n${[i.body, i.extractedText, i.aiSummary].filter(Boolean).join('\n')}`,
      )
      .join('\n\n')
      .slice(0, 100_000);
    const completion = await this.client!.chat.completions.create({
      model: this.model(),
      messages: [
        {
          role: 'system',
          content:
            'Answer using ONLY the provided context. If the answer is not in the context, say you do not know. Be concise.',
        },
        { role: 'user', content: `Context:\n${ctx}\n\nQuestion: ${question}` },
      ],
      temperature: 0.2,
    });
    const answer = completion.choices[0]?.message?.content?.trim() || '';
    return { answer };
  }
}
