import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { User } from '../users/entities/user.entity';
import { ResponseService, uuid } from '@/utils';
import { CreatePropertyDto, ImageslDto } from './dto/create-property.dto';
import { RolesEnum } from '@/enums';

describe('PropertyService', () => {
  let service: PropertyService;
  let propertyRepository: jest.Mocked<Repository<Property>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let responseService: jest.Mocked<ResponseService>;
  let testingImage;
  let userId = uuid();
  let propertyId = uuid();

  beforeEach(async () => {
    const mockPropertyRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockResponseService = {
      Response: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: getRepositoryToken(Property), useValue: mockPropertyRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get(getRepositoryToken(Property));
    userRepository = module.get(getRepositoryToken(User));
    responseService = module.get(ResponseService);
    testingImage = require('path').resolve(__dirname, '../../assets/testing.jpg');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property successfully', async () => {
      const user = { id: '1' } as User;

      const imageFiles: ImageslDto = {
        thumbnail: testingImage,
        gallery: [testingImage],
      };
      const createPropertyDto: CreatePropertyDto = {
        title: 'Test Property',
        description: 'A great property',
        price: 100,
        location: 'Test Location',

      };
      const mockHost = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: RolesEnum.HOST,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        status: true,
        deleted_at: null,
      } as User;

      userRepository.findOne.mockResolvedValue(mockHost);
      propertyRepository.create.mockReturnValue({
        ...createPropertyDto,
        thumbnail: 'thumbnail.jpg',
        gallery: ['gallery1.jpg', 'gallery2.jpg'],
        host: mockHost,
        id: propertyId,
      } as Property);
      propertyRepository.save.mockResolvedValue({
        ...createPropertyDto,
        thumbnail: 'thumbnail.jpg',
        gallery: ['gallery1.jpg', 'gallery2.jpg'],
        host: mockHost,
        id: uuid(),
      } as Property);

      await service.create({
        title: 'Test Property',
        description: 'A great property',
        price: 100,
        location: 'Test Location',
      }, {
        thumbnail: testingImage,
        gallery: [testingImage],
      }, {
        id: userId,
        role: RolesEnum.HOST,

      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['properties'] });
      expect(propertyRepository.create).toHaveBeenCalledWith({
        title: 'Test Property',
        description: 'A great property',
        price: 100,
        location: 'Test Location',
        thumbnail: 'thumbnail.jpg',
        gallery: ['gallery1.jpg', 'gallery2.jpg'],
      });
      expect(propertyRepository.save).toHaveBeenCalled();
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Property created successfully',
        data: expect.any(Object),
        statusCode: 201,
        key: 'property',
      });
    });

  });

  it('should return an error if thumbnail is missing', async () => {
    const user = { id: '1' } as User;
    const createPropertyDto: CreatePropertyDto = {
      title: 'Test Property',
      description: 'A great property',
      price: 100,
      location: 'Test Location',
    };
    const imageFiles: ImageslDto = { thumbnail: null, gallery: [] };

    await service.create(createPropertyDto, imageFiles, user);

    expect(responseService.Response).toHaveBeenCalledWith({
      message: 'Thumbnail is required',
      statusCode: 400,
    });
  });

  describe('findAll', () => {
    it('should fetch all properties successfully', async () => {
      const mockProperties = [
        {
          id: uuid(), title: 'Property 1',
          description: 'A great property',
          price: 100,
          location: 'Test Location',
          thumbnail: 'thumbnail.jpg',
          gallery: ['gallery1.jpg', 'gallery2.jpg'],
          status: true, host: {} as User,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          deleted_at: null,
          bookings: {} as any,
          amenities: 'Amenities',

        },
        ,
      ];

      propertyRepository.find.mockResolvedValue(mockProperties);

      await service.findAll();

      expect(propertyRepository.find).toHaveBeenCalledWith({ where: { status: true }, relations: ['host'] });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Properties fetched successfully',
        data: mockProperties,
        statusCode: 200,
        key: 'properties',
      });
    });
  });

  describe('findOne', () => {
    it('should fetch a property by ID successfully', async () => {
      const mockProperty = {
        id: propertyId, title: 'Property 1',
        description: 'A great property',
        price: 100,
        location: 'Test Location',
        thumbnail: 'thumbnail.jpg',
        gallery: ['gallery1.jpg', 'gallery2.jpg'],
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        amenities: 'Amenities',

        status: true, host: {} as User,
        bookings: {} as any
      };

      propertyRepository.findOne.mockResolvedValue(mockProperty);

      await service.findOne(propertyId);

      expect(propertyRepository.findOne).toHaveBeenCalledWith({
        where: { id: propertyId, status: true },
        relations: ['host'],
      });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Property fetched successfully',
        data: mockProperty,
        statusCode: 200,
        key: 'property',
      });
    });

    it('should return an error if property is not found', async () => {
      propertyRepository.findOne.mockResolvedValue(null);

      await service.findOne('999');

      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Property not found',
        statusCode: 404,
      });
    });
  });
});

