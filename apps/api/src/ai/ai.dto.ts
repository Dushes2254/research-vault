import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class SummaryDto {
  @ApiProperty({ description: 'ID материала (VaultItem)' })
  @IsString()
  itemId: string;
}

export class SuggestTagsDto {
  @ApiProperty()
  @IsString()
  itemId: string;
}

export class AskDto {
  @ApiProperty({ type: [String], example: ['clxxx1', 'clxxx2'] })
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];

  @ApiProperty({ example: 'Какие основные тезисы в этих материалах?' })
  @IsString()
  @MinLength(1)
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;
}

export class AiSummaryResponse {
  @ApiProperty()
  summary: string;
}

export class SuggestTagsResponse {
  @ApiProperty({ type: [String] })
  tags: string[];
}

export class AskResponse {
  @ApiProperty()
  answer: string;
}
