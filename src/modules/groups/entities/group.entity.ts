import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/utils/base.entity';

export enum Permission {
  // Group
  GROUP_CREATE = 'GROUP_CREATE',
  GROUP_DELETE = 'GROUP_DELETE',
  GROUP_UPDATE = 'GROUP_UPDATE',
  GROUP_GET = 'GROUP_GET', // only for SuperAdmin to prevent regular user to access groups.
}

export enum GROUP_TAGS {
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  GROUP_MANAGEMENT = 'GROUP_MANAGEMENT',
}

export enum GROUP_TYPE {
  MANAGMENT = 'MANAGMENT',
}

@Entity()
@Unique(['name', 'type'])
export class Group extends BaseEntity {
  constructor(props: Partial<Group>) {
    super(props);
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'enum', enum: Permission, array: true, nullable: true })
  @ApiProperty({ enum: Permission, isArray: true })
  permissions: Permission[];

  @Column({ default: false })
  @ApiProperty()
  defaultForNewUsers: boolean;

  @Column('enum', {
    enum: GROUP_TAGS,
    nullable: true,
    array: true,
  })
  @ApiProperty()
  tags: GROUP_TAGS[];

  @Column({
    type: 'enum',
    enum: GROUP_TYPE,
    default: GROUP_TYPE.MANAGMENT,
  })
  type: GROUP_TYPE;
}
