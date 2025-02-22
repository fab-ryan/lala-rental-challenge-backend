import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Roles, User } from '@/common';
import { AuthGuard, AuthUserType } from '@/guards';
import { BookingStatus } from '@/enums/booking';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesEnum } from '@/enums';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST,RolesEnum.RENTER)
  @Post()
  createBooking(@Body() createBookingDto: CreateBookingDto, @User() user: AuthUserType) {
    return this.bookingService.createBooking(createBookingDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST,RolesEnum.RENTER)
  @Get()
  getBookings(@User() user: AuthUserType) {
    return this.bookingService.getBookings(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @Get('host')
  getHostBookings(@User() user: AuthUserType) {
    return this.bookingService.getBookingByHost(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST,RolesEnum.RENTER)
  @Patch(':id/status')
  updateBookingStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingService.updateBookingStatus(id, status);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @Patch(':id/check-in')
  async checkIn(@Param('id') bookingId: string) {
    return this.bookingService.checkInBooking(bookingId);
  }
}
