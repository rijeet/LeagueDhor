import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../../APP.BLL/user/user.service';
import { UserUsecase } from '../../APP.BLL/user/user.usecase';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { PrismaModule } from '../../APP.Infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserUsecase, UserRepository],
})
export class UserModule {}
