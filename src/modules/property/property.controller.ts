import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, ParseUUIDPipe, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiAcceptedResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard, AuthUserType } from '@/guards';
import { Roles, User } from '@/common';
import { RolesEnum } from '@/enums';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { storage } from '@/utils';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiAcceptedResponse({
    description: 'Property created successfully',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'thumbnail',
          maxCount: 1,
        },
        {
          name: 'gallery',
          maxCount: 10,
        },
      ],
      { storage },
    ),
  )
  create(@Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: { thumbnail: Express.Multer.File, gallery: Express.Multer.File[] },
    @User() user: AuthUserType,
  ) {
    return this.propertyService.create(createPropertyDto, files, user);
  }


  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST, RolesEnum.RENTER)
  @Get('host-properties')
  getHostProperties(@User() user: AuthUserType) {
    return this.propertyService.getHostProperties(user);
  }

  @Get('search')
  searchProperty(@Query('search') search: string) {
    return this.propertyService.findPropertiesByLocationOrTitle(search);
  }
 
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertyService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @ApiConsumes('multipart/form-data')
  @ApiAcceptedResponse({
    description: 'Property created successfully',

  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'thumbnail',
          maxCount: 1,
        },
        {
          name: 'gallery',
          maxCount: 10,
        },
      ],
      { storage },
    ),
  )
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files: { thumbnail: Express.Multer.File, gallery: Express.Multer.File[] },
    @User() user: AuthUserType,
  ) {
    return this.propertyService.update(id, updatePropertyDto, user, files);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.HOST)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertyService.remove(id);
  }


}
