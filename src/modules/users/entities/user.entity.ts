import {
  Entity,
  Column,
  PrimaryColumn,
  Unique,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { RolesEnum as Roles } from '@/enums';
import { uuid } from '@/utils';

@Entity('users')
export class User {
  constructor(partial: Partial<User>) {
    this.id = uuid();
    Object.assign(this, partial);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: false, unique: true })
  @IsEmail()
  @IsNotEmpty()
  @Unique('email', ['email'])
  email: string;

  @Column({ nullable: false, default: true })
  status: boolean;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.RENTER,
  })
  role: Roles;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Exclude()
  password: string;


  @Type(() => Date)
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}


