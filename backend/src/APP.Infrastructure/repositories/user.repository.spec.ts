import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../../APP.Entity/user.entity';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';
import { UserRole } from '../../APP.Shared/enums/user-role.enum';

describe('UserRepository', () => {
  let repository: UserRepository;
  let typeOrmRepository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    typeOrmRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto & { id: string } = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
      };

      const expectedUser: User = {
        ...createUserDto,
        anonymousName: undefined,
        createdAt: new Date(),
        userSessions: [],
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        role: UserRole.USER,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should default role to USER if not provided', async () => {
      const createUserDto: CreateUserDto & { id: string } = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
      };

      const expectedUser: User = {
        ...createUserDto,
        role: UserRole.USER,
        anonymousName: undefined,
        createdAt: new Date(),
        userSessions: [],
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      await repository.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        role: UserRole.USER,
      });
    });
  });

  describe('findAll', () => {
    it('should return all users ordered by createdAt DESC', async () => {
      const users: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          role: UserRole.USER,
          createdAt: new Date('2024-01-02'),
          userSessions: [],
        },
        {
          id: '2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          role: UserRole.USER,
          createdAt: new Date('2024-01-01'),
          userSessions: [],
        },
      ];

      mockRepository.find.mockResolvedValue(users);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.USER,
        createdAt: new Date(),
        userSessions: [],
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await repository.findOne('123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.USER,
        createdAt: new Date(),
        userSessions: [],
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await repository.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(user);
    });
  });
});
