import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import {
  AddTagBodyDto,
  ArchiveBodyDto,
  CreateItemDto,
  UpdateItemDto,
  UploadMetaDto,
} from './dto';
import { VaultItemType } from '@prisma/client';

@Controller('items')
@ApiTags('items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class VaultController {
  constructor(private vault: VaultService) {}

  @Get()
  @ApiOperation({
    summary: 'Список материалов',
    description: 'Поиск по title/body/extractedText/url, фильтры по типу, тегу, коллекции.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Поисковая строка' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['link', 'note', 'file', 'snippet', 'video'],
  })
  @ApiQuery({ name: 'tagId', required: false })
  @ApiQuery({ name: 'collectionId', required: false })
  @ApiQuery({ name: 'archived', required: false, description: '1 или true — включая архив' })
  @ApiResponse({ status: 200, description: 'Массив материалов' })
  list(
    @User() u: { id: string },
    @Query('q') q?: string,
    @Query('type') type?: VaultItemType,
    @Query('tagId') tagId?: string,
    @Query('collectionId') collectionId?: string,
    @Query('archived') archived?: string,
  ) {
    return this.vault.list(u.id, {
      search: q,
      type,
      tagId,
      collectionId,
      includeArchived: archived === '1' || archived === 'true',
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Создать материал',
    description:
      'Для `link`/`video` укажите `url` — поставится в очередь на парсинг. Для `file` используйте `POST /items/upload`.',
  })
  @ApiResponse({ status: 201, description: 'Созданный материал (с вложенными тегами)' })
  create(@User() u: { id: string }, @Body() dto: CreateItemDto) {
    return this.vault.create(u.id, dto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Загрузить файл как материал типа `file`',
    description: 'Поле `file` — бинарный файл, до 15MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        tagNames: { type: 'string', description: 'теги через запятую' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Созданный материал' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  upload(
    @User() u: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMetaDto,
  ) {
    if (!file) throw new BadRequestException('file is required');
    const tagNames = body.tagNames
      ? body.tagNames
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    return this.vault.createFileItem(u.id, file, body.title, tagNames);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Материал по ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 404, description: 'Не найдено' })
  getOne(@User() u: { id: string }, @Param('id') id: string) {
    return this.vault.getById(u.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить материал' })
  @ApiParam({ name: 'id' })
  update(@User() u: { id: string }, @Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.vault.update(u.id, id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Архивировать / разархивировать' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 404, description: 'Не найдено' })
  archive(
    @User() u: { id: string },
    @Param('id') id: string,
    @Body() body: ArchiveBodyDto,
  ) {
    return this.vault.archive(u.id, id, body.action === 'archive');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить материал' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: '{ ok: true }' })
  remove(@User() u: { id: string }, @Param('id') id: string) {
    return this.vault.remove(u.id, id);
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Добавить тег к материалу' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 404, description: 'Материал не найден' })
  addTag(
    @User() u: { id: string },
    @Param('id') id: string,
    @Body() body: AddTagBodyDto,
  ) {
    return this.vault.addTag(u.id, id, body.name);
  }

  @Post(':id/reprocess')
  @ApiOperation({
    summary: 'Повторить фоновую обработку',
    description: 'Для ссылок/файлов: перезапуск парсинга/извлечения текста.',
  })
  @ApiParam({ name: 'id' })
  reprocess(@User() u: { id: string }, @Param('id') id: string) {
    return this.vault.reprocess(u.id, id);
  }
}
