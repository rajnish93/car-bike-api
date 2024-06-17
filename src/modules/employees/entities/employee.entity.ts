import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/utils/base.entity';

@Entity()
@Unique(['email'])
export class Employee extends BaseEntity {
  constructor(props: Partial<Employee>) {
    super(props);
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  firstName: string;

  @Column()
  @ApiProperty()
  lastName: string;

  @Column()
  @ApiProperty()
  email: string;

  @Column({ nullable: true })
  @ApiProperty()
  phone: string;

  @Column({ default: true })
  @ApiProperty()
  isActive: boolean;
}
