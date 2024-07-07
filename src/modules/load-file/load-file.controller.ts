import {
  Controller,
  Get,
  StreamableFile,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LoadFileService } from './load-file.service';
import type { Response } from 'express';
import { Readable } from 'stream';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('File')
@Controller('load-file')
export class LoadFileController {
  constructor(private readonly loadFileService: LoadFileService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.loadFileService.findOne(id);
    const stream = Readable.from(file.data);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });

    return new StreamableFile(stream);
  }
}
