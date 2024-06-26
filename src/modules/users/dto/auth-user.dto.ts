import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthUserDto {
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
  password: string;
}
