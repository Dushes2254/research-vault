import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokensResponse, AuthUserResponse, LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './user.decorator';

@Controller('auth')
@ApiTags('auth')
@ApiExtraModels(AuthUserResponse, AuthTokensResponse)
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация', description: 'Создаёт пользователя и сразу возвращает JWT.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: AuthTokensResponse, description: 'accessToken + user' })
  @ApiResponse({ status: 409, description: 'Email уже зарегистрирован' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthTokensResponse })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiResponse({ status: 200, type: AuthUserResponse })
  @ApiResponse({ status: 401, description: 'Нет/неверный токен' })
  me(@User() user: { id: string; email: string }) {
    return user;
  }
}
