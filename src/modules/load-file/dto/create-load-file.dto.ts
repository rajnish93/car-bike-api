import { IsNotEmpty } from 'class-validator';

export class CreateLoadFileDto {
  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  data: Uint8Array | Buffer | string;
}
