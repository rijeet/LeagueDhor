import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from '../../APP.BLL/user/user.service';
import { UserUsecase } from '../../APP.BLL/user/user.usecase';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { User } from '../../APP.Entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserUsecase, UserRepository],
})
export class UserModule {}
