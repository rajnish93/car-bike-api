import {
  Controller,
  Get,
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
import { ImageValidator } from 'src/utils/validators/imageValidator';

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
    @UploadedFile(new ImageValidator())
    uploadedFile: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      user.userId,
      uploadedFile.buffer,
      uploadedFile.originalname,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@User() user) {
    return this.usersService.getUserInfo(user.userId);
  }
}
