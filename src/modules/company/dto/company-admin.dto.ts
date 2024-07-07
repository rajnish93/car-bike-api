import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CompanyAdminDto {
  @ApiProperty({
    example: 'Rajnish Singh',
    description: 'Name of the administrator.',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  @Transform(({ value }) => value?.trim())
  readonly name: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'The email address of the administrator.',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  @IsNotEmpty({ message: 'Email should not be empty' })
  readonly email: string;

  @ApiProperty({
    example: 'password@123',
    description: 'The password of the User',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(5, { message: 'Password should contain more than 5 letters' })
  @MaxLength(100, { message: 'Password length should not be more than 100 ' })
  readonly password: string;

  @ApiProperty({
    example: 'Test Company',
    description: 'Name of the Company',
  })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name should not be empty' })
  @Transform(({ value }) => value?.trim())
  readonly companyName: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  readonly companySize: string;
}
