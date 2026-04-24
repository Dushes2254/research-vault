import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'password42' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password42' })
  @IsString()
  password: string;
}

export class AuthUserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}

export class AuthTokensResponse {
  @ApiProperty({ description: 'Используй в заголовке Authorization: Bearer <accessToken>' })
  accessToken: string;

  @ApiProperty({ type: () => AuthUserResponse })
  user: AuthUserResponse;
}
