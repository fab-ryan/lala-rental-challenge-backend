import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, AuthUserType } from '@/guards';
import { Roles, User } from '@/common';
import { RolesEnum } from '@/enums';


@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @Get()
  getStats(@User() user: AuthUserType) {
    return this.statsService.getStats(user);
  }
}
