import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('tags')
@ApiTags('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class TagsController {
  constructor(private tags: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Список тегов текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Массив { id, name }' })
  list(@User() u: { id: string }) {
    return this.tags.list(u.id);
  }
}
