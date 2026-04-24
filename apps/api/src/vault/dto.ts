import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  IsEnum,
} from 'class-validator';
import type { VaultItemType } from '@prisma/client';

const TYPES: VaultItemType[] = ['link', 'note', 'file', 'snippet', 'video'];

export class CreateItemDto {
  @ApiProperty({ enum: TYPES, example: 'link' })
  @IsIn(TYPES)
  type: VaultItemType;

  @ApiProperty({ example: 'Статья про React' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ description: 'Текст заметки / snippet' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ example: 'https://example.com/article' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ type: [String], example: ['react', 'perf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];
}

export class UpdateItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'AI-саммари (ручная правка опциональна)' })
  @IsOptional()
  @IsString()
  aiSummary?: string;
}

const ArchiveAction = ['archive', 'unarchive'] as const;
export class ArchiveBodyDto {
  @ApiProperty({ enum: ArchiveAction, example: 'archive' })
  @IsIn(ArchiveAction)
  action: 'archive' | 'unarchive';
}

export class AddTagBodyDto {
  @ApiProperty({ example: 'typescript' })
  @IsString()
  name: string;
}

export class UploadMetaDto {
  @ApiPropertyOptional({ example: 'Мой PDF' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Теги через запятую', example: 'doc, work' })
  @IsOptional()
  @IsString()
  tagNames?: string;
}
