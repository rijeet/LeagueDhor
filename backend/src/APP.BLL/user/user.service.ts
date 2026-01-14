import { Injectable } from '@nestjs/common';
import { UserUsecase } from './user.usecase';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';
import { User } from '../../APP.Entity/user.entity';

@Injectable()
export class UserService {
  constructor(private userUsecase: UserUsecase) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.userUsecase.createUser(dto);
  }

  async findAll(): Promise<User[]> {
    return this.userUsecase.getAllUsers();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userUsecase.getUserById(id);
  }
}
