import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Property } from '../property/entities/property.entity';
import { Booking } from '../booking/entities/booking.entity';
import { ResponseService } from '@/utils';
import { AuthUserType } from '@/guards';
import { BookingStatus } from '@/enums/booking';


@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    private readonly responseService: ResponseService,

  ) { }

  async getStats(user: AuthUserType) {
    const host = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['properties']
    });
    const userCount = await this.userRepository.count();
    const allProperties = await this.propertyRepository.createQueryBuilder('property')
      .leftJoinAndSelect('property.host', 'host')
      .getMany();

    const propertyCount = allProperties.filter(property => property.host.id === user.id).length;

    const bookingCount = await this.bookingRepository.count({ where: { property: host.properties } });
    const bookingRevenue = await this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.property', 'property')
      .andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .where('property.host = :id', { id: user.id })
      .getMany();
    const totalRevenue = bookingRevenue.reduce((acc, booking) => acc + Number(booking.property.price), 0);

    return this.responseService.Response({
      message: 'Stats fetched successfully',
      statusCode: 200,
      data: {
        userCount,
        propertyCount,
        bookingCount,
        totalRevenue,
      },
      key: 'stats'
    })
  }


}
