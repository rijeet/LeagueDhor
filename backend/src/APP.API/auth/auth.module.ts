import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from '../../APP.BLL/auth/auth.service';
import { AuthUsecase } from '../../APP.BLL/auth/auth.usecase';
import { UserRepository } from '../../APP.Infrastructure/repositories/user.repository';
import { AdminRepository } from '../../APP.Infrastructure/repositories/admin.repository';
import { UserSessionRepository } from '../../APP.Infrastructure/repositories/user-session.repository';
import { AdminSessionRepository } from '../../APP.Infrastructure/repositories/admin-session.repository';
import { JwtAuthModule } from '../../APP.Infrastructure/jwt/jwt.module';
import { EmailModule } from '../../APP.Infrastructure/email/email.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { User } from '../../APP.Entity/user.entity';
import { Admin } from '../../APP.Entity/admin.entity';
import { UserSession } from '../../APP.Entity/user-session.entity';
import { AdminSession } from '../../APP.Entity/admin-session.entity';

@Module({
  imports: [
    JwtAuthModule,
    EmailModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Admin, UserSession, AdminSession]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUsecase,
    UserRepository,
    AdminRepository,
    UserSessionRepository,
    AdminSessionRepository,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
