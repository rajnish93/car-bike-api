import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoadFileService } from '../load-file/load-file.service';
import { LoadFile } from '../load-file/entities/load-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoadFile])],
  controllers: [UsersController],
  providers: [UsersService, LoadFileService],
})
export class UsersModule {}
