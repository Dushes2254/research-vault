import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ExtractService {
  private readonly log = new Logger(ExtractService.name);

  async extractFromUrl(url: string): Promise<{
    title: string;
    description?: string;
    previewImageUrl?: string;
    extractedText: string;
    sourceHost: string;
  }> {
    const host = new URL(url).hostname;
    const res = await axios.get(url, {
      timeout: 20000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'ResearchVault/1.0 (compatible; +https://example.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      responseType: 'text',
    });
    const html = typeof res.data === 'string' ? res.data : String(res.data);
    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').first().text()?.trim() ||
      url;
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      undefined;
    const previewImageUrl =
      $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || undefined;
    const mainText =
      $('article').text() || $('main').text() || $('body').text() || '';
    const extractedText = this.clip(mainText.replace(/\s+/g, ' ').trim(), 20000);
    this.log.log(`Extracted page host=${host} textLen=${extractedText.length}`);
    return { title, description, previewImageUrl, extractedText, sourceHost: host };
  }

  async extractTextFromFile(buffer: Buffer, mime: string): Promise<string> {
    if (mime.startsWith('text/') || mime === 'application/json' || mime.includes('xml')) {
      return this.clip(buffer.toString('utf8'), 20000);
    }
    if (mime === 'application/pdf') {
      return '(PDF content extraction not enabled in MVP; upload a text file or add OCR later.)';
    }
    return `Binary file (${mime}), stored for reference.`;
  }

  private clip(s: string, n: number) {
    if (s.length <= n) return s;
    return s.slice(0, n) + '…';
  }
}
