import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm'; // Import OneToMany
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../utils/base.entity';
import { Company } from '../../company/entities/company.entity';
import { Booking } from '../../booking/entities/booking.entity'; // Import Booking

export enum VehicleType {
  CAR = 'CAR',
  BIKE = 'BIKE',
}

export enum VehicleAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('vehicles')
@Unique(['registrationNumber'])
export class Vehicle extends BaseEntity {
  @ApiProperty({
    description: 'Unique identifier for the vehicle',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Type of the vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @ApiProperty({ description: 'Make of the vehicle', example: 'Toyota' })
  @Column()
  make: string;

  @ApiProperty({ description: 'Model of the vehicle', example: 'Camry' })
  @Column()
  model: string;

  @ApiProperty({ description: 'Manufacturing year of the vehicle', example: 2021 })
  @Column()
  year: number;

  @ApiProperty({ description: 'Color of the vehicle', example: 'Red' })
  @Column()
  color: string;

  @ApiProperty({ description: 'Registration number of the vehicle', example: 'XYZ123' })
  @Column()
  registrationNumber: string;

  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGCM82691A123456',
    nullable: true,
  })
  @Column({ unique: true, nullable: true })
  vin?: string;

  @ApiProperty({ description: 'Hourly rental rate', example: 15.5 })
  @Column('float')
  hourlyRate: number;

  @ApiProperty({ description: 'Daily rental rate', example: 100.0 })
  @Column('float')
  dailyRate: number;

  @ApiProperty({
    description: 'Availability status of the vehicle',
    enum: VehicleAvailabilityStatus,
    default: VehicleAvailabilityStatus.AVAILABLE,
  })
  @Column({
    type: 'enum',
    enum: VehicleAvailabilityStatus,
    default: VehicleAvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: VehicleAvailabilityStatus;

  @ApiProperty({ description: 'Mileage of the vehicle', example: 25000, nullable: true })
  @Column({ type: 'int', nullable: true })
  mileage?: number;

  @ApiProperty({
    description: 'Current location address of the vehicle',
    example: '123 Main St, Anytown',
    nullable: true,
  })
  @Column({ nullable: true })
  locationAddress?: string;

  @ApiProperty({
    description: 'URL of the vehicle image',
    example: 'http://example.com/image.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: 'ID of the company owning the vehicle' })
  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.vehicles)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Booking, (booking) => booking.vehicle)
  bookings: Booking[];
}
