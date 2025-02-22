import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { hashPassword, ResponseService, uuid } from '@/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesEnum } from '@/enums';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let responseService: jest.Mocked<ResponseService>;
  let userId = uuid()

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      exists: jest.fn(),
    };

    const mockResponseService = {
      Response: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    responseService = module.get(ResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: RolesEnum.RENTER,
      };
      const hashedPassword = await hashPassword(createUserDto.password);
      const mockUser = {
        id: userId, ...createUserDto, password: hashedPassword,
        status: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        properties: [] as any,
        bookings: [] as any,

      };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      userRepository.exists.mockResolvedValue(false);

      await service.create(createUserDto);


      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User created successfully',
        data: mockUser,
        statusCode: 201,
        key: 'user',
      });
    });

    it('should return an error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: RolesEnum.RENTER,
      };

      userRepository.exists.mockResolvedValue(true);

      await service.create(createUserDto);

      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Email already exists',
        statusCode: 400,
      });
    });
  });

  describe('findAll', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [
        {
          id: userId,
          name: 'Test User 1',
          email: 'test@example.com',
          role: RolesEnum.RENTER,
          status: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          deleted_at: null,
          password: undefined,
          properties: [] as any,
        bookings: [] as any,

        }
      ]
      userRepository.find.mockResolvedValue(mockUsers);

      await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Users fetched successfully',
        data: mockUsers,
        key: 'users',
      });
    });
  });

  describe('findOne', () => {
    it('should fetch a user by ID successfully', async () => {
      const mockUser = {
        id: userId, name: 'Test User', email: 'test@example.com',
        role: RolesEnum.RENTER,
        status: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        password: undefined,
        properties: [] as any,
        bookings: [] as any,

      };
      userRepository.findOne.mockResolvedValue(mockUser);

      await service.findOne(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        withDeleted: true,
      });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User fetched successfully',
        data: mockUser,
        key: 'user',
      });
    });

    it('should return an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.findOne('1');

      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const mockUser = {
        id: userId, name: 'Old Name', email: 'test@example.com',
        role: RolesEnum.RENTER,
        status: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        password: undefined,
        properties: [] as any,
        bookings: [] as any,

      };
      userRepository.findOne.mockResolvedValue(mockUser);

      await service.update(userId, updateUserDto);

      expect(userRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User updated successfully',
        statusCode: 200,
      });
    });

    it('should return an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.update(userId, {});

      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: userId, name: 'Test User', email: 'test@example.com',
        role: RolesEnum.RENTER,
        status: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        password: undefined,
        properties: [] as any,
        bookings: [] as any,
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      await service.remove(userId);

      expect(userRepository.softDelete).toHaveBeenCalledWith(userId);
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User deleted successfully',
        statusCode: 200,
      });
    });

    it('should return an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.remove('1');

      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
});
