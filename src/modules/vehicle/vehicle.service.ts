import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
// import { Company } from '../company/entities/company.entity'; // Needed if we check company existence

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    // Optionally inject CompanyRepository if needed for validation
    // @InjectRepository(Company)
    // private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, companyId: string): Promise<Vehicle> {
    // Optional: Validate if the companyId exists
    // const company = await this.companyRepository.findOneBy({ id: companyId });
    // if (!company) {
    //   throw new NotFoundException(`Company with ID ${companyId} not found`);
    // }

    const newVehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      companyId, // Set the companyId for the new vehicle
    });
    return this.vehicleRepository.save(newVehicle);
  }

  async findAll(companyId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.find({ where: { companyId } });
  }

  async findOne(id: string, companyId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id, companyId } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found or does not belong to your company.`);
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, companyId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(id, companyId); // Ensures vehicle exists and belongs to the company

    // If VIN is being updated, check for uniqueness if it's provided
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
        const existingVehicleWithVin = await this.vehicleRepository.findOne({ where: { vin: updateVehicleDto.vin } });
        if (existingVehicleWithVin && existingVehicleWithVin.id !== id) {
            throw new ForbiddenException(`VIN ${updateVehicleDto.vin} is already in use by another vehicle.`);
        }
    }

    // If registration number is being updated, check for uniqueness
    if (updateVehicleDto.registrationNumber && updateVehicleDto.registrationNumber !== vehicle.registrationNumber) {
        const existingVehicleWithReg = await this.vehicleRepository.findOne({ where: { registrationNumber: updateVehicleDto.registrationNumber } });
        if (existingVehicleWithReg && existingVehicleWithReg.id !== id) {
            throw new ForbiddenException(`Registration number ${updateVehicleDto.registrationNumber} is already in use by another vehicle.`);
        }
    }

    this.vehicleRepository.merge(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const vehicle = await this.findOne(id, companyId); // Ensures vehicle exists and belongs to the company
    await this.vehicleRepository.remove(vehicle);
  }
}
