import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the vehicle to book',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Start time of the booking (ISO 8601 format)',
    example: '2024-07-01T10:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string; // Using string for DTO, will be converted to Date object

  @ApiProperty({
    description: 'End time of the booking (ISO 8601 format)',
    example: '2024-07-01T18:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  // Add custom validator to ensure endTime is after startTime if needed
  endTime: string; // Using string for DTO, will be converted to Date object

  // companyId might be part of the DTO if not derivable from vehicleId or user context
  // For now, assuming companyId will be determined in the service/controller logic
  // @ApiProperty({
  //   description: 'ID of the company providing the vehicle',
  //   example: 'c1a3f5e7-8c2d-4a9f-b8e1-5f7c9d0a2b4f',
  // })
  // @IsNotEmpty()
  // @IsUUID()
  // companyId: string;
}
