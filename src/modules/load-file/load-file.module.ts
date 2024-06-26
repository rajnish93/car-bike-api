import { Module } from '@nestjs/common';
import { LoadFileService } from './load-file.service';
import { LoadFileController } from './load-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoadFile } from './entities/load-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoadFile])],
  controllers: [LoadFileController],
  providers: [LoadFileService],
})
export class LoadFileModule {}
