import { IsNotEmpty } from 'class-validator';

export class CreateLoadFileDto {
  @IsNotEmpty({ message: 'File Name should not be empty' })
  filename: string;

  @IsNotEmpty({ message: 'Data should not be empty' })
  data: Uint8Array | Buffer | string;
}
