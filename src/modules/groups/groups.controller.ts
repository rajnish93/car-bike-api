import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Group } from './entities/group.entity';
import { DeleteResult } from 'typeorm';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiCreatedResponse({ type: Group })
  @ApiBadRequestResponse({ description: 'Data validation error' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOkResponse({ isArray: true, type: Group })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Group })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Group })
  @ApiBadRequestResponse({ description: 'Data validation error' })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: DeleteResult })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
