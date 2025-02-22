import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Property } from '../property/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Property, Booking]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
