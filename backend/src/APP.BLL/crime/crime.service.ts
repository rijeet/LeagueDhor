import { Injectable } from '@nestjs/common';
import { CrimeUsecase } from './crime.usecase';
import { CreateCrimeDto } from '../../APP.Shared/dto/create-crime.dto';
import { CreateCrimeWithPersonDto } from '../../APP.Shared/dto/create-crime-with-person.dto';
import { Crime } from '../../APP.Entity/crime.entity';

@Injectable()
export class CrimeService {
  constructor(private crimeUsecase: CrimeUsecase) {}

  async create(dto: CreateCrimeDto): Promise<Crime> {
    return this.crimeUsecase.createCrime(dto);
  }

  async createWithPerson(dto: CreateCrimeWithPersonDto): Promise<Crime> {
    return this.crimeUsecase.createCrimeWithPerson(dto);
  }

  async findByPersonId(personId: string): Promise<Crime[]> {
    return this.crimeUsecase.getCrimesByPersonId(personId);
  }

  async findByPersonSlug(slug: string): Promise<Crime[]> {
    return this.crimeUsecase.getCrimesByPersonSlug(slug);
  }

  async findAll(): Promise<Crime[]> {
    return this.crimeUsecase.getAllCrimes();
  }

  async findById(id: string): Promise<Crime> {
    return this.crimeUsecase.getCrimeById(id);
  }

  async delete(id: string): Promise<void> {
    return this.crimeUsecase.deleteCrime(id);
  }

  async updateStatus(id: string, status: string): Promise<Crime> {
    return this.crimeUsecase.updateCrimeStatus(id, status);
  }
}
