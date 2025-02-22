import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../property/entities/property.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Booking, User, Property]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
