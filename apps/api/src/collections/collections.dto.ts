import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Чтение на выходных' })
  @IsString()
  @MinLength(1)
  name: string;
}

export class AddItemToCollectionDto {
  @ApiProperty({ description: 'ID материала (VaultItem)' })
  @IsString()
  vaultItemId: string;
}
