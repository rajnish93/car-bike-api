import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly firstName: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly isActive?: boolean;
}
