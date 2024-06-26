import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Rajnish Singh',
    description: 'The name of the User',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'rajnish@example.com',
    description: 'The email of the User',
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password@123',
    description: 'The password of the User',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password should contain more than 5 letters' })
  @MaxLength(100, { message: 'Password length should not be more than 100 ' })
  password: string;
}
