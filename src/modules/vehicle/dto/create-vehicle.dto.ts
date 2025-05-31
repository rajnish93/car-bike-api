import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
  Matches,
  Length,
} from 'class-validator';
import { VehicleType, VehicleAvailabilityStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Type of the vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsNotEmpty()
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ description: 'Make of the vehicle', example: 'Toyota' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  make: string;

  @ApiProperty({ description: 'Model of the vehicle', example: 'Camry' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  model: string;

  @ApiProperty({ description: 'Manufacturing year of the vehicle', example: 2021 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1980)
  @Max(new Date().getFullYear() + 1) // Allow up to next year
  year: number;

  @ApiProperty({ description: 'Color of the vehicle', example: 'Red' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 30)
  color: string;

  @ApiProperty({ description: 'Registration number of the vehicle', example: 'XYZ123' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]+$/, { message: 'Registration number must be alphanumeric' })
  @Length(3, 10)
  registrationNumber: string;

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

  @ApiProperty({ description: 'Hourly rental rate', example: 15.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate: number;

  @ApiProperty({ description: 'Daily rental rate', example: 100.0 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyRate: number;

  @ApiProperty({
    description: 'Availability status of the vehicle',
    enum: VehicleAvailabilityStatus,
    default: VehicleAvailabilityStatus.AVAILABLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleAvailabilityStatus)
  availabilityStatus?: VehicleAvailabilityStatus = VehicleAvailabilityStatus.AVAILABLE;

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
  // Add IsUrl decorator if you want to validate the URL format
  imageUrl?: string;

  // companyId will be extracted from the authenticated user or other means,
  // but if it needs to be part of DTO for some reason:
  // @ApiProperty({ description: 'ID of the company owning the vehicle', example: 'b1a3f5e7-8c2d-4a9f-b8e1-5f7c9d0a2b4e' })
  // @IsNotEmpty()
  // @IsUUID()
  // companyId: string;
}
