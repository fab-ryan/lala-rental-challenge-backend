import {
  Entity,
  Column,
  PrimaryColumn,
  Unique,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { RolesEnum as Roles } from '@/enums';
import { uuid } from '@/utils';
import { Property } from '@/modules/property/entities/property.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';

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

  @Exclude()
  @Type(() => Property)
  @OneToMany(() => Property, (property) => property.host, { eager: true })
  properties: Property;

  @ManyToOne(() => Booking, (property) => property.user)
  bookings: Booking;

  @Type(() => Date)
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  
}


