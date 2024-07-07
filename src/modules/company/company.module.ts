import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { Company } from './entities/company.entity';
import { UsersService } from '../users/users.service';
import { LoadFileService } from '../load-file/load-file.service';
import { LoadFile } from '../load-file/entities/load-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, Group, LoadFile])],
  controllers: [CompanyController],
  providers: [CompanyService, UsersService, LoadFileService],
})
export class CompanyModule {}
