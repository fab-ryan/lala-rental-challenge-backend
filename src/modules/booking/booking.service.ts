import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Property } from '../property/entities/property.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ResponseService } from '@/utils';
import { BookingStatus } from '@/enums/booking';
import { AuthUserType } from '@/guards';
import { User } from '../users/entities/user.entity';
import { MailsService } from '../mails/mails.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,

    private readonly responseService: ResponseService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailsService
  ) { }

  async createBooking(createBookingDto: CreateBookingDto, auth: AuthUserType) {
    try {
      const { checkInDate, checkOutDate, propertyId, review } = createBookingDto;
      const property = await this.propertyRepository.findOne(
        {
          where: { id: propertyId },
        }
      );
    
      if (!property) {
        return this.responseService.Response({
          message: 'Property not found',
          statusCode: 404,
        });
      }
      const overlappingBookings = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.property = :propertyId', { propertyId })
        .andWhere('booking.checkIn <= :checkOut', { checkOut: checkOutDate })
        .andWhere('booking.checkOut >= :checkIn', { checkIn: checkInDate })
        .andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED })
        .andWhere('booking.user = :userId', { userId: auth.id })
        .getMany();

      if (overlappingBookings.length > 0) {
        return this.responseService.Response({
          message: 'Booking overlaps with existing booking',
          statusCode: 400,
        });
      }

      const user = await this.userRepository.findOne({
        where: { id: auth.id }
      })
      const booking = this.bookingRepository.create({
        property,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: BookingStatus.PENDING,
        user: user,
        message: review || ''

      });
      await this.bookingRepository.save(booking);
      return this.responseService.Response({
        message: 'Booking created successfully',
        statusCode: 201,
        data: booking,
      });
    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      });
    }
  }

  async getBookings(auth: AuthUserType) {
    try {
      const bookings = await this.bookingRepository.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.property', 'property')
        .leftJoinAndSelect('property.host', 'host')
        .leftJoinAndSelect('booking.user', 'user')
        .where('user.id = :userId', { userId: auth.id })
        .getMany();


      return this.responseService.Response({
        message: 'Bookings fetched successfully',
        statusCode: 200,
        data: bookings,
        key: 'bookings'
      });
    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      });
    }
  }

  async getBookingByHost(auth: AuthUserType) {
    try {
      const properties = await this.bookingRepository.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.property', 'property')
        .leftJoinAndSelect('property.host', 'host')
        .leftJoinAndSelect('booking.user', 'user')
        .where('host.id = :hostId', { hostId: auth.id })
        .getMany();

      return this.responseService.Response({
        message: 'Bookings fetched successfully',
        statusCode: 200,
        data: properties,
        key: 'bookings'
      });
    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      });
    }
  }
  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['user']
      });
      if (!booking) {
        return this.responseService.Response({
          message: 'Booking not found',
          statusCode: 404,
        });
      }
      booking.status = BookingStatus.CONFIRMED;
      if (status === 'confirmed') {
        await this.mailService.sendUserNotificationConfirmationBooking({
          email: booking.user.email,
          name: booking.user.name,
          startingDate: new Date(booking.checkIn).toDateString(),
          endingDate: new Date(booking.checkOut).toDateString(),
        })
      }
      await this.bookingRepository.save(booking);
      return this.responseService.Response({
        message: 'Booking status updated successfully',
        statusCode: 200,
        data: booking,
      });

    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      });
    }
  }


  async getMyBookings(auth: AuthUserType) {
    try {
      const bookings = await this.bookingRepository.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.property', 'property')
        .where('booking.user = :userId', { userId: auth.id })
        .getMany();
      return this.responseService.Response({
        message: 'Bookings fetched successfully',
        statusCode: 200,
        data: bookings,
      });
    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      });
    }
  }
  async checkInBooking(bookingId: string) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
      });
      if (!booking) {
        return this.responseService.Response({
          message: 'Booking not found',
          statusCode: 404,
        });
      }
      if (booking.status !== BookingStatus.CONFIRMED) {
        return this.responseService.Response({
          message: 'Booking is not confirmed',
          statusCode: 400,
        });
      }
      booking.status = BookingStatus.CHECKED_IN;
      await this.bookingRepository.save(booking);
      return this.responseService.Response({
        message: 'Booking checked in successfully',
        statusCode: 200,
        data: booking,
      });
    } catch (error) {
      const erroMessage = (error as Error).message;
      return this.responseService.Response({
        message: erroMessage,
        statusCode: 500,
      })
    }
  }



}
