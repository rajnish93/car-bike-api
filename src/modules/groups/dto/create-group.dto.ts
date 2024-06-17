import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsString,
} from 'class-validator';
import { GROUP_TAGS, Permission } from '../entities/group.entity';

export class CreateGroupDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly name: string;

  @ApiProperty({ enum: Permission, isArray: true })
  @IsDefined()
  @IsArray()
  @IsEnum(Permission, { each: true })
  readonly permissions: Permission[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  readonly defaultForNewUsers?: boolean;

  @ApiPropertyOptional({ enum: GROUP_TAGS, isArray: true })
  @IsArray()
  @IsEnum(GROUP_TAGS, { each: true })
  readonly tags?: GROUP_TAGS[];
}
