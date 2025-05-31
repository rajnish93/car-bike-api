import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../utils/base.entity';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @ApiProperty({
    description: 'Unique identifier for the booking',
    example: 'b1a3f5e7-8c2d-4a9f-b8e1-5f7c9d0a2b4e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the booked vehicle' })
  @Column()
  vehicleId: string;

  @ApiProperty({ description: 'ID of the user who made the booking' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'ID of the company providing the vehicle' })
  @Column()
  companyId: string;

  @ApiProperty({ description: 'Start time of the booking', example: '2024-07-01T10:00:00Z' })
  @Column('timestamp with time zone')
  startTime: Date;

  @ApiProperty({ description: 'End time of the booking', example: '2024-07-01T18:00:00Z' })
  @Column('timestamp with time zone')
  endTime: Date;

  @ApiProperty({ description: 'Total price of the booking', example: 120.5 })
  @Column('float')
  totalPrice: number;

  @ApiProperty({
    description: 'Status of the booking',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  bookingStatus: BookingStatus;

  @ApiProperty({
    description: 'Payment status of the booking',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.bookings)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company, (company) => company.bookings)
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
