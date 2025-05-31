import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entities/company.entity';
// import { AuthModule } from '../auth/auth.module'; // If needed

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Vehicle, User, Company]),
    // AuthModule, // If guards/strategies from AuthModule are used directly and not globally
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
