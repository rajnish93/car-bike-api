import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoadFile } from './entities/load-file.entity';
import { CreateLoadFileDto } from './dto/create-load-file.dto';

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

  async create(createFileDto: CreateLoadFileDto) {
    const newFile = this.loadFileRepository.create({
      filename: createFileDto.filename,
      data: createFileDto.data,
    });

    return await this.loadFileRepository.save(newFile);
  }

  async remove(uuid: string) {
    const file = await this.loadFileRepository.findOne({
      where: { id: uuid },
    });
    // If File is not found, throw NotFoundException
    if (!file) {
      throw new NotFoundException(`File with UUID ${uuid} not found`);
    }

    return this.loadFileRepository.delete(file.id);
  }
}
