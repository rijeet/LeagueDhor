import { Test, TestingModule } from '@nestjs/testing';
import { UserUsecase } from './user.usecase';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';
import { User } from '../../APP.Entity/user.entity';
import { UserRole } from '../../APP.Shared/enums/user-role.enum';

describe('UserUsecase', () => {
  let usecase: UserUsecase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUsecase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usecase = module.get<UserUsecase>(UserUsecase);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
      };

      const expectedUser: User = {
        id: 'generated-uuid',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
        createdAt: new Date(),
        userSessions: [],
      };

      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await usecase.createUser(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDto,
          id: expect.any(String),
        }),
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          role: UserRole.USER,
          createdAt: new Date(),
          userSessions: [],
        },
        {
          id: '2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          role: UserRole.USER,
          createdAt: new Date(),
          userSessions: [],
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await usecase.getAllUsers();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.USER,
        createdAt: new Date(),
        userSessions: [],
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usecase.getUserById('123');

      expect(userRepository.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await usecase.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });
});
