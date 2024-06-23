import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoadFile } from './entities/load-file.entity';

@Injectable()
export class LoadFileService {
  constructor(
    @InjectRepository(LoadFile)
    private readonly loadFileRepository: Repository<LoadFile>,
  ) {}

  async findOne(uuid: string) {
    const file = await this.loadFileRepository.findOne({ where: { id: uuid } });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }
}
