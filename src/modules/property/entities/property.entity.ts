import {
    Entity,
    Column,
    PrimaryColumn,
    Unique,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { uuid } from '@/utils';
import { User } from '@/modules/users/entities/user.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('properties')
export class Property {
    constructor(partial: Partial<Property>) {
        this.id = uuid();
        Object.assign(this, partial);
    }

    @PrimaryColumn()
    id: string;



    @Column()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Column('text')
    @IsString()
    @IsNotEmpty()
    description: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    location: string;

    @Column('decimal', { precision: 10, scale: 2 })
    @IsNotEmpty()
    price: number;

    @Column({ nullable: false, default: true })
    status: boolean;

    @Column({ nullable: true, })
    @IsString()
    @IsNotEmpty()
    amenities: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    thumbnail: string;

    @Column('text', { array: true, nullable: true })
    gallery: string[];

    @Type(() => User)
    @ManyToOne(() => User, (user) => user.properties)
    host: User;

    @Type(() => Booking)
    @OneToMany(() => Booking, (booking) => booking.property)
    bookings: Booking[];

    @Type(() => Date)
    @CreateDateColumn({ type: 'timestamp', nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: false })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;


}
