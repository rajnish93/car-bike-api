import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoadFile {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  filename: string;

  @Column({
    type: 'bytea',
  })
  data: Uint8Array | Buffer | string;
}
