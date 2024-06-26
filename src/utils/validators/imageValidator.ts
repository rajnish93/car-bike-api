import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';

@Injectable()
export class ImageValidator implements PipeTransform {
  MAX_AVATAR_FILE_SIZE = 1024 * 1024; // 1MB in bytes
  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file || !file.buffer || file.buffer.length < 4) {
      throw new BadRequestException(
        'Invalid file upload: File data is missing',
      );
    }

    const parseFilePipe = new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: this.MAX_AVATAR_FILE_SIZE,
        }),
      ],
    });

    try {
      await parseFilePipe.transform(file);
    } catch {
      throw new BadRequestException(
        `Uploaded file exceeds maximum allowed size (${this.MAX_AVATAR_FILE_SIZE} bytes)`,
      );
    }

    const hex = this.getFileHex(file.buffer);
    const mimeType = this.getMimeType(hex.substring(0, 8));

    if (!mimeType) {
      throw new BadRequestException(
        'Invalid file type. Please upload an image (JPEG or PNG)',
      );
    }

    return file;
  }

  private getFileHex(buffer: Buffer): string | undefined {
    const uintArray = new Uint8Array(buffer);
    const hex = Array.from(uintArray)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    return hex;
  }

  private getMimeType(hex: string): string | undefined {
    switch (hex) {
      case 'FFD8FFE0':
      case 'FFD8FFE1':
      case 'FFD8FFE2':
      case 'FFD8FFEE':
      case 'FFD8FFDB':
        return 'image/jpeg';
      case '89504E47':
        return 'image/png';
      default:
        return undefined;
    }
  }
}
