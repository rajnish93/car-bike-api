import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    // Check if the group name already exists
    const existingGroup = await this.groupRepository.findOne({
      where: { name: createGroupDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('Group name already exists');
    }

    // Create a new group entity based on the DTO
    const newGroup = this.groupRepository.create(createGroupDto);

    // Save the new group to the database
    return await this.groupRepository.save(newGroup);
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async findOne(uuid: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: uuid } });
    if (!group) {
      throw new NotFoundException(`Group with UUID ${uuid} not found`);
    }
    return group;
  }

  async update(uuid: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: uuid } });
    // If group is not found, throw NotFoundException
    if (!group) {
      throw new NotFoundException(`Group with UUID ${uuid} not found`);
    }

    Object.assign(group, updateGroupDto);

    return await this.groupRepository.save(group);
  }

  async remove(uuid: string): Promise<any> {
    const group = await this.groupRepository.findOne({ where: { id: uuid } });
    // If group is not found, throw NotFoundException
    if (!group) {
      throw new NotFoundException(`Group with UUID ${uuid} not found`);
    }

    return this.groupRepository.delete(group.id);
  }
}
