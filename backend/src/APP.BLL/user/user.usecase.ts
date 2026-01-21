import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';
import { User } from '../../APP.Entity/user.entity';

@Injectable()
export class UserUsecase {
  constructor(private userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.userRepository.create({
      ...dto,
      id: randomUUID(),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }
}
