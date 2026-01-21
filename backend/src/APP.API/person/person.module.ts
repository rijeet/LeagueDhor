import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './person.controller';
import { PersonService } from '../../APP.BLL/person/person.service';
import { PersonUsecase } from '../../APP.BLL/person/person.usecase';
import { PersonRepository } from '../../APP.Infrastructure/repositories/person.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { Person } from '../../APP.Entity/person.entity';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([Person])],
  controllers: [PersonController],
  providers: [PersonService, PersonUsecase, PersonRepository, JwtStrategy],
})
export class PersonModule {}
