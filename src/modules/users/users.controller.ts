import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBearerAuth, ApiBody, } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@/guards';
import { Roles } from '@/common';
import { RolesEnum as Role } from '@/enums';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.HOST)
  @ApiQuery({ name: 'limit', required: false })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.HOST, Role.RENTER)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.HOST)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.HOST)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
