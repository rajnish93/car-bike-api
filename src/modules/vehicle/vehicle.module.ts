import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { Company } from '../company/entities/company.entity'; // Assuming Company entity path

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Company])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService], // Export VehicleService
})
export class VehicleModule {}
