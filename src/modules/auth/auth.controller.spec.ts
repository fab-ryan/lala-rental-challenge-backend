import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      authLogin: jest.fn(),
      loginWithGoogle: jest.fn(),
      googleCallback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /auth/login)', () => {
    it('should call AuthService.authLogin with correct parameters', async () => {
      const createAuthDto: CreateAuthDto = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { message: 'Login successful', statusCode: 200, data: { token: 'jwt_token' } };

      authService.authLogin.mockResolvedValue(mockResponse as any);

      const result = await controller.create(createAuthDto);

      expect(authService.authLogin).toHaveBeenCalledWith(createAuthDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('google (GET /auth/google)', () => {
    it('should call AuthService.loginWithGoogle', () => {
      const mockResponse = { message: 'Login with google', statusCode: 200 };

      authService.loginWithGoogle.mockReturnValue(mockResponse as any);

      const result = controller.google();

      expect(authService.loginWithGoogle).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('googleCallback (GET /auth/google/callback)', () => {
    it('should call AuthService.googleCallback with request object', async () => {
      const req = { user: { email: 'test@example.com', name: 'Test User' } };
      const mockResponse = { message: 'Login successful', statusCode: 200, data: { token: 'jwt_token' } };

      authService.googleCallback.mockResolvedValue(mockResponse as any);

      const result = await controller.googleCallback(req);

      expect(authService.googleCallback).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockResponse);
    });
  });
});
