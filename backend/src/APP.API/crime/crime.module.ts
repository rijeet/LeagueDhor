import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrimeController } from './crime.controller';
import { CrimeService } from '../../APP.BLL/crime/crime.service';
import { CrimeUsecase } from '../../APP.BLL/crime/crime.usecase';
import { CrimeRepository } from '../../APP.Infrastructure/repositories/crime.repository';
import { PersonRepository } from '../../APP.Infrastructure/repositories/person.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Crime } from '../../APP.Entity/crime.entity';
import { Person } from '../../APP.Entity/person.entity';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([Crime, Person])],
  controllers: [CrimeController],
  providers: [CrimeService, CrimeUsecase, CrimeRepository, PersonRepository, JwtStrategy, RolesGuard],
})
export class CrimeModule {}
