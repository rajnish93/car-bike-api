import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './utils/env.validation';
import { DatabaseModule } from './modules/database/database.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { UsersModule } from './modules/users/users.module';
import { LoadFileModule } from './modules/load-file/load-file.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      cache: true,
      expandVariables: true,
      isGlobal: true,
    }),
    DatabaseModule,
    GroupsModule,
    EmployeesModule,
    UsersModule,
    LoadFileModule,
    AuthModule,
    CompanyModule,
    VehicleModule,
    BookingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
