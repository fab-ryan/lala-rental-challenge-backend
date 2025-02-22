import { Injectable } from '@nestjs/common';
import { CreatePropertyDto, ImageslDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ResponseService } from '@/utils';
import { AuthUserType } from '@/guards';
import { User } from '../users/entities/user.entity';


@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly responseService: ResponseService

  ) { }

  async create(createPropertyDto: CreatePropertyDto, imageFiles: ImageslDto, user: AuthUserType) {
    try {
      const { title, description, price, location, amenities } = createPropertyDto;
      if (!imageFiles.thumbnail) {
        this.responseService.Response({
          message: 'Thumbnail is required',
          statusCode: 400,
        })
      }
      if (!imageFiles.gallery) {
        this.responseService.Response({
          message: 'Gallery is required',
          statusCode: 400,
        })
      }
      const thumbnail = imageFiles?.thumbnail[0]?.filename || '';
      const gallery = imageFiles?.gallery?.map((image) => image.filename) || [];
      const host = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['properties']
      });

      const property = this.propertyRepository.create({
        title,
        description,
        price,
        location,
        thumbnail,
        gallery,
        host,
        amenities
      })
      await this.propertyRepository.save(property);

      return this.responseService.Response({
        message: 'Property created successfully',
        data: property,
        statusCode: 201,
        key: 'property'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async findAll() {
    try {
      const properties = await this.propertyRepository.createQueryBuilder('property')
        .andWhere('property.status = :status', { status: true })
        .leftJoinAndSelect('property.host', 'host')
        .orderBy('property.created_at', 'DESC')
        .getMany();

      return this.responseService.Response({
        message: 'Properties fetched successfully',
        data: properties,
        statusCode: 200,
        key: 'properties'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async findPropertiesByLocationOrTitle(search: string) {
    try {
      console.log(search);
      const properties = await this.propertyRepository.createQueryBuilder('property')
        .where('property.title ILIKE :search', { search: `%${search}%` })
        .orWhere('property.location ILIKE :search', { search: `%${search}%` })
        .andWhere('property.status = :status', { status: true })
        .leftJoinAndSelect('property.host', 'host')
        .orderBy('property.created_at', 'DESC')
        .getMany();
      return this.responseService.Response({
        message: 'Properties fetched successfully',
        data: properties,
        statusCode: 200,
        key: 'properties'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async findOne(id: string) {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id, status: true },
        relations: ['host']
      });
      if (!property) {
        this.responseService.Response({
          message: 'Property not found',
          statusCode: 404,
        })
      }
      const relatedProperties = await this.propertyRepository.createQueryBuilder('property')
        .where('property.id != :id', { id })
        .andWhere('property.status = :status', { status: true })
        .leftJoinAndSelect('property.host', 'host')
        .orderBy('property.created_at', 'DESC')
        .take(2)
        .getMany();
      return this.responseService.Response({
        message: 'Property fetched successfully',
        data: { property, recommended: relatedProperties },
        statusCode: 200,
        key: 'property'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }



  async update(id: string, updatePropertyDto: UpdatePropertyDto, user: AuthUserType, imageFiles: ImageslDto) {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: ['host']
      });
      if (!property) {
        this.responseService.Response({
          message: 'Property not found',
          statusCode: 404,
        })
      }
      if (property.host.id !== user.id) {
        this.responseService.Response({
          message: 'You are not authorized to perform this action',
          statusCode: 403,
        })
      }
      const { title, description, price, location, } = updatePropertyDto;
      if (imageFiles.thumbnail) {
        property.thumbnail = imageFiles.thumbnail.filename;
      }
      if (imageFiles.gallery) {
        property.gallery = imageFiles.gallery.map((image) => image.filename);
      }
      property.title = title;
      property.description = description;
      property.price = price;
      property.location = location;
      await this.propertyRepository.save(property);

      return this.responseService.Response({
        message: 'Property updated successfully',
        data: property,
        statusCode: 200,
        key: 'property'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })

    }
  }

  async remove(id: string) {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: ['host']
      });
      if (!property) {
        this.responseService.Response({
          message: 'Property not found',
          statusCode: 404,
        })
      }
      await this.propertyRepository.softDelete(id);
      return this.responseService.Response({
        message: 'Property deleted successfully',
        statusCode: 200,
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async getHostProperties(user: AuthUserType) {
    try {
      const allProperties = await this.propertyRepository.find({
        relations: ['host']
      });
      const properties = allProperties.filter(property => property.host.id === user.id);
      return this.responseService.Response({
        message: 'Properties fetched successfully',
        data: properties,
        statusCode: 200,
        key: 'properties'
      })
    } catch (error) {
      console.log(user);
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
        statusCode: 500,
      })
    }
  }

  async getRelatedProperties(id: string) {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: ['host']
      });
      if (!property) {
        this.responseService.Response({
          message: 'Property not found',
          statusCode: 404,
        })
      }
      const properties = await this.propertyRepository.createQueryBuilder('property')
        .where('property.id != :id', { id })
        .andWhere('property.status = :status', { status: true })
        .leftJoinAndSelect('property.host', 'host')
        .orderBy('property.created_at', 'DESC')
        .getMany();

      return this.responseService.Response({
        message: 'Related properties fetched successfully',
        data: properties,
        statusCode: 200,
        key: 'properties'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }
}
