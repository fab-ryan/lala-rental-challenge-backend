import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository', () => {
  let repository: Repository<User>;
  const mockUUID = uuidv4(); // Generate a valid UUID for testing

  beforeEach(async () => {
    const mockUserRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save a user and return the saved entity', async () => {
      const mockUser = { id: mockUUID, name: 'Test User', email: 'test@example.com' };
      repository.save = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.save(mockUser);

      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should find a user by UUID', async () => {
      const mockUser = { id: mockUUID, name: 'Test User', email: 'test@example.com' };
      repository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.findOne({ where: { id: mockUUID } });

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockUUID } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);

      const result = await repository.findOne({ where: { id: uuidv4() } });

      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true if email exists', async () => {
      repository.exists = jest.fn().mockResolvedValue(true);

      const result = await repository.exists({ where: { email: 'test@example.com' } });

      expect(repository.exists).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      repository.exists = jest.fn().mockResolvedValue(false);

      const result = await repository.exists({ where: { email: 'nonexistent@example.com' } });

      expect(repository.exists).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(result).toBe(false);
    });
  });
});
