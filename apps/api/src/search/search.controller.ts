import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { VaultItemType } from '@prisma/client';

@Controller('search')
@ApiTags('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class SearchController {
  constructor(private search: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Поиск материалов (упрощённый full-text по полям)' })
  @ApiQuery({ name: 'q', required: true, description: 'Поисковая строка' })
  @ApiQuery({ name: 'type', required: false, enum: ['link', 'note', 'file', 'snippet', 'video'] })
  @ApiResponse({ status: 200, description: 'Массив материалов; пустой q → []' })
  find(
    @User() u: { id: string },
    @Query('q') q: string,
    @Query('type') type?: VaultItemType,
  ) {
    if (!q?.trim()) return [];
    return this.search.search(u.id, q, type);
  }
}
