import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { AddItemToCollectionDto, CreateCollectionDto } from './collections.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('collections')
@ApiTags('collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CollectionsController {
  constructor(private col: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Список коллекций текущего пользователя' })
  @ApiResponse({ status: 200, description: 'OK' })
  list(@User() u: { id: string }) {
    return this.col.list(u.id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать коллекцию' })
  @ApiResponse({ status: 201, description: 'Создано' })
  create(@User() u: { id: string }, @Body() body: CreateCollectionDto) {
    return this.col.create(u.id, body.name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Коллекция с материалами' })
  @ApiParam({ name: 'id', description: 'ID коллекции' })
  @ApiResponse({ status: 404, description: 'Не найдено' })
  getOne(@User() u: { id: string }, @Param('id') id: string) {
    return this.col.getOne(u.id, id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Добавить материал в коллекцию' })
  @ApiParam({ name: 'id', description: 'ID коллекции' })
  @ApiResponse({ status: 404, description: 'Коллекция или материал не найдены' })
  @ApiResponse({ status: 409, description: 'Материал уже в коллекции' })
  addItem(
    @User() u: { id: string },
    @Param('id') id: string,
    @Body() body: AddItemToCollectionDto,
  ) {
    if (!body?.vaultItemId) throw new BadRequestException('vaultItemId required');
    return this.col.addItem(u.id, id, body.vaultItemId);
  }
}
