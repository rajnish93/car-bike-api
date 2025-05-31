import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Matches,
  Length,
} from 'class-validator';
import { VehicleType, VehicleAvailabilityStatus } from '../entities/vehicle.entity';
import { CreateVehicleDto } from './create-vehicle.dto';

// UpdateVehicleDto can extend PartialType(CreateVehicleDto)
// if @nestjs/mapped-types is installed, which makes all fields optional.
// For now, defining explicitly or using PartialType from swagger if it works standalone.

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  // No need to redefine properties if PartialType works as expected.
  // If specific overrides or different validation rules for update are needed,
  // they can be added here. For example:

  @ApiProperty({
    description: 'Type of the vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @ApiProperty({ description: 'Make of the vehicle', example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  make?: string;

  @ApiProperty({ description: 'Model of the vehicle', example: 'Camry', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  model?: string;

  @ApiProperty({ description: 'Manufacturing year of the vehicle', example: 2021, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiProperty({ description: 'Color of the vehicle', example: 'Red', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 30)
  color?: string;

  @ApiProperty({ description: 'Registration number of the vehicle', example: 'XYZ123', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]+$/, { message: 'Registration number must be alphanumeric' })
  @Length(3, 10)
  registrationNumber?: string;

  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGCM82691A123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(17, 17)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, { message: 'Invalid VIN format' })
  vin?: string;

  @ApiProperty({ description: 'Hourly rental rate', example: 15.5, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Daily rental rate', example: 100.0, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyRate?: number;

  @ApiProperty({
    description: 'Availability status of the vehicle',
    enum: VehicleAvailabilityStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleAvailabilityStatus)
  availabilityStatus?: VehicleAvailabilityStatus;

  @ApiProperty({ description: 'Mileage of the vehicle', example: 25000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @ApiProperty({
    description: 'Current location address of the vehicle',
    example: '123 Main St, Anytown',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  locationAddress?: string;

  @ApiProperty({
    description: 'URL of the vehicle image',
    example: 'http://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
