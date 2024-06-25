import {
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiConsumes, ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from 'src/decorators/user/user.decorator';

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Upload user avatar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async addAvatar(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_AVATAR_FILE_SIZE }),
        ],
      }),
    )
    uploadedFile: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      user.id,
      uploadedFile.buffer,
      uploadedFile.originalname,
    );
  }
}