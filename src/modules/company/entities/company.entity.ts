import { ApiProperty } from '@nestjs/swagger';
import { Group } from 'src/modules/groups/entities/group.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vehicle } from 'src/modules/vehicle/entities/vehicle.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity'; // Import Booking entity
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Company extends BaseEntity {
  constructor(props: Partial<Company>) {
    super(props);
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ name: 'company_size', nullable: true })
  @ApiProperty()
  companySize: string;

  @OneToMany(() => Group, (group) => group.company)
  groups: Group[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.company)
  vehicles: Vehicle[];

  @OneToMany(() => Booking, (booking) => booking.company)
  bookings: Booking[];
}
