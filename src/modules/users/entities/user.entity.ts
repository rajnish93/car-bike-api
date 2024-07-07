import { ApiProperty } from '@nestjs/swagger';
import { Group } from 'src/modules/groups/entities/group.entity';
import { LoadFile } from 'src/modules/load-file/entities/load-file.entity';
import { BaseEntity } from 'src/utils/base.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from 'src/modules/company/entities/company.entity';
import { SOURCE_TYPE, STATUS_TYPE } from 'src/helpers/user.helpers';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  constructor(props: Partial<User>) {
    super(props);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ name: 'first_name', nullable: true })
  @ApiProperty()
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  @ApiProperty()
  lastName: string;

  @Column()
  @ApiProperty()
  email: string;

  @Column()
  @ApiProperty()
  password: string;

  @Column({ nullable: true })
  @ApiProperty()
  phone: string;

  @Column({
    type: 'enum',
    enum: STATUS_TYPE,
    default: STATUS_TYPE.INVITED,
  })
  status: STATUS_TYPE;

  @Column({
    type: 'enum',
    enum: SOURCE_TYPE,
    default: SOURCE_TYPE.INVITE,
  })
  source: SOURCE_TYPE;

  // @Column({ type: 'enum', enum: Permission, array: true, nullable: true })
  // @ApiProperty({ enum: Permission, isArray: true })
  // permissions: Permission[];
  // @Column({ type: 'enum', enum: Permission, array: true, nullable: true })
  // @ApiProperty({ enum: Permission, isArray: true })
  // permissions: Permission[];

  @Column({ name: 'avatar_id', nullable: true, default: null })
  avatarId?: string;

  @JoinColumn({ name: 'avatar_id' })
  @OneToOne(() => LoadFile, {
    nullable: true,
  })
  avatar?: LoadFile;

  // @Column({ nullable: true })
  // designation: string;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: 'CASCADE',
  })
  @Index({ where: `"companyId" IS NOT NULL` })
  company: Company;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, (group) => group.users, {
    onDelete: 'CASCADE',
  })
  @Index({ where: `"groupId" IS NOT NULL` })
  group: Group;
}
