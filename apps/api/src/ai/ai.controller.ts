import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  AskDto,
  AskResponse,
  AiSummaryResponse,
  SuggestTagsDto,
  SuggestTagsResponse,
  SummaryDto,
} from './ai.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('ai')
@ApiTags('ai')
@ApiExtraModels(AiSummaryResponse, SuggestTagsResponse, AskResponse)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('summary')
  @ApiOperation({ summary: 'Сгенерировать краткое саммари по материалу', description: 'Требуется `OPENAI_API_KEY` на сервере.' })
  @ApiBody({ type: SummaryDto })
  @ApiResponse({ status: 200, type: AiSummaryResponse })
  @ApiResponse({ status: 400, description: 'Материал не найден' })
  @ApiResponse({ status: 503, description: 'OpenAI не настроен' })
  summary(@User() u: { id: string }, @Body() body: SummaryDto) {
    return this.ai.summary(u.id, body.itemId);
  }

  @Post('suggest-tags')
  @ApiOperation({ summary: 'Предложить теги (список строк)', description: 'Теги не применяются автоматически — только ответ API.' })
  @ApiBody({ type: SuggestTagsDto })
  @ApiResponse({ status: 200, type: SuggestTagsResponse })
  @ApiResponse({ status: 503, description: 'OpenAI не настроен' })
  suggestTags(@User() u: { id: string }, @Body() body: SuggestTagsDto) {
    return this.ai.suggestTags(u.id, body.itemId);
  }

  @Post('ask')
  @ApiOperation({
    summary: 'Вопрос по контексту выбранных материалов (RAG-лайт)',
    description: 'Контекст собирается из title/body/extractedText/aiSummary указанных материалов.',
  })
  @ApiBody({ type: AskDto })
  @ApiResponse({ status: 200, type: AskResponse })
  @ApiResponse({ status: 400, description: 'Неверные itemIds' })
  @ApiResponse({ status: 503, description: 'OpenAI не настроен' })
  ask(@User() u: { id: string }, @Body() body: AskDto) {
    return this.ai.ask(u.id, body.itemIds, body.question);
  }
}
