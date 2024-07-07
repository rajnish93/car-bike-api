import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsDefined()
  @IsString({ message: 'First Name must be a string' })
  @IsNotEmpty({ message: 'First Name should not be empty' })
  readonly firstName: string;

  @ApiProperty()
  @IsDefined()
  @IsString({ message: 'Last Name must be a string' })
  readonly lastName: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly isActive?: boolean;
}
