import {
    Entity, Column, ManyToOne, PrimaryColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,

} from 'typeorm';

import { User } from '@/modules/users/entities/user.entity';
import { Property } from '@/modules/property/entities/property.entity';
import { uuid } from '@/utils';
import { BookingStatus } from '@/enums/booking';
import { Type } from 'class-transformer';

@Entity('bookings')
export class Booking {
    constructor(partial: Partial<Booking>) {
        Object.assign(this, partial);
        this.id = uuid();
    }
    @PrimaryColumn('uuid')
    id: string;

    @Column('date')
    checkIn: string;

    @Column('date')
    checkOut: string;

    @Type(() => Property)
    @ManyToOne(() => Property, (property) => property.bookings)
    property: Property;

    @ManyToOne(() => User, (user) => user.bookings)
    user: User;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status: BookingStatus;

    @Column('text', { nullable: true })
    message: string;

    @Type(() => Date)
    @CreateDateColumn({ type: 'timestamp', nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: false })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;


}
