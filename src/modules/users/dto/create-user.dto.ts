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
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    example: 'rajnish@example.com',
    description: 'The email address of the User.',
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
}
