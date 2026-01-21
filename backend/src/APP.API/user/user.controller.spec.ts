import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../APP.BLL/user/user.service';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';
import { User } from '../../APP.Entity/user.entity';
import { UserRole } from '../../APP.Shared/enums/user-role.enum';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
      };

      const expectedUser: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
        createdAt: new Date(),
        userSessions: [],
      };

      mockUserService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
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
      ];

      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
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

      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(user);
    });
  });
});
