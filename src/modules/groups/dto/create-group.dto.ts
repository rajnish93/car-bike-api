import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { GROUP_TAGS } from '../entities/group.entity';
import { Permission } from '../../../helpers/permission.enum';

export class CreateGroupDto {
  @ApiProperty()
  @IsDefined()
  @IsString({ message: 'Group Name must be a string' })
  @IsNotEmpty({ message: 'Group Name should not be empty' })
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
