import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if the employee email already exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee email already exists');
    }

    // Create a new employee entity based on the DTO
    const newEmployee = this.employeeRepository.create(createEmployeeDto);

    // Save the new employee to the database
    return await this.employeeRepository.save(newEmployee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async findOne(uuid: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: uuid },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with UUID ${uuid} not found`);
    }
    return employee;
  }

  async update(
    uuid: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: uuid },
    });
    // If employee is not found, throw NotFoundException
    if (!employee) {
      throw new NotFoundException(`Employee with UUID ${uuid} not found`);
    }

    Object.assign(employee, updateEmployeeDto);

    return await this.employeeRepository.save(employee);
  }

  async remove(uuid: string): Promise<any> {
    const employee = await this.employeeRepository.findOne({
      where: { id: uuid },
    });
    // If employee is not found, throw NotFoundException
    if (!employee) {
      throw new NotFoundException(`Employee with UUID ${uuid} not found`);
    }

    return this.employeeRepository.delete(employee.id);
  }
}
