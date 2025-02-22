import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '@/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hashPassword, ResponseService, uuid } from '@/utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RolesEnum as Roles, RolesEnum } from '@/enums';
import { UsersModule } from '../users/users.module';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let responseService: jest.Mocked<ResponseService>;
  let usersService: jest.Mocked<UsersService>;
  let userId = uuid();

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockResponseService = {
      Response: jest.fn(),
    };

    const mockUsersService = {
      checkEmailExist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule
      ],
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ResponseService, useValue: mockResponseService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    responseService = module.get(ResponseService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authLogin', () => {
    it('should return 404 if user does not exist', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password123' };

      usersService.checkEmailExist.mockResolvedValue(false);

      await service.authLogin(dto);

      expect(usersService.checkEmailExist).toHaveBeenCalledWith(dto.email);
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return 400 if password does not match', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = { email: dto.email, password: 'hashedpassword' } as User;

      usersService.checkEmailExist.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await service.authLogin(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, mockUser.password);
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Incorrect email or password',
        statusCode: 400,
      });
    });

    it('should return a JWT token on successful login', async () => {

      const createUserDto = {
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
      };


      usersService.checkEmailExist.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('jwt_token');

      const result = await service.authLogin({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser.id, role: mockUser.role });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Login successful',
        statusCode: 200,
        data: { token: 'jwt_token' },
        key: 'access_token',
      });
      expect(result).toBeDefined();
    });
  });

  describe('googleCallback', () => {
    it('should create a new user if not existing and return JWT token', async () => {
      const mockGoogleUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const req = { user: mockGoogleUser };
      const mockUser = { id: userId, email: mockGoogleUser.email, role: Roles.RENTER , name: `${mockGoogleUser.firstName} ${mockGoogleUser.lastName}`};

      usersService.checkEmailExist.mockResolvedValue(false);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('jwt_token');

      const result = await service.googleCallback(req);

      expect(usersService.checkEmailExist).toHaveBeenCalledWith(mockGoogleUser.email);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: mockGoogleUser.email,
        name: `${mockGoogleUser.firstName} ${mockGoogleUser.lastName}`,
        role: Roles.RENTER,
        password: expect.any(String),
        status: true,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser.id, role: mockUser.role });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Login successful',
        statusCode: 200,
        data: { token: 'jwt_token' },
        key: 'access_token',
      });
      expect(result).toBeDefined();
    });

    it('should return JWT token for existing user', async () => {
      const mockGoogleUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const req = { user: mockGoogleUser };
      const mockUser = { id: uuid(), email: mockGoogleUser.email, role: Roles.RENTER };

      usersService.checkEmailExist.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('jwt_token');

      const result = await service.googleCallback(req);

      expect(usersService.checkEmailExist).toHaveBeenCalledWith(mockGoogleUser.email);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: mockGoogleUser.email } });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser.id, role: mockUser.role });
      expect(responseService.Response).toHaveBeenCalledWith({
        message: 'Login successful',
        statusCode: 200,
        data: { token: 'jwt_token' },
        key: 'access_token',
      });
      expect(result).toBeDefined();
    });
  });
});
