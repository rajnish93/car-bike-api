import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DeleteResult } from 'typeorm';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Employee } from './entities/employee.entity';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiCreatedResponse({ type: Employee })
  @ApiBadRequestResponse({ description: 'Data validation error' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOkResponse({ isArray: true, type: Employee })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Employee })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Employee })
  @ApiBadRequestResponse({ description: 'Data validation error' })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: DeleteResult })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
