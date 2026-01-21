import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crime } from '../../APP.Entity/crime.entity';
import { CreateCrimeDto } from '../../APP.Shared/dto/create-crime.dto';
import { VerificationStatus } from '../../APP.Shared/enums/verification-status.enum';

@Injectable()
export class CrimeRepository {
  constructor(
    @InjectRepository(Crime)
    private readonly crimeRepository: Repository<Crime>,
  ) {}

  async create(data: CreateCrimeDto & { id: string }): Promise<Crime> {
    const crime = this.crimeRepository.create({
      ...data,
      verificationStatus: data.verificationStatus || VerificationStatus.UNVERIFIED,
    });
    return this.crimeRepository.save(crime);
  }

  async findByPersonId(personId: string): Promise<Crime[]> {
    return this.crimeRepository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPersonSlug(slug: string): Promise<Crime[]> {
    return this.crimeRepository
      .createQueryBuilder('crime')
      .innerJoin('crime.person', 'person')
      .where('person.slug = :slug', { slug })
      .orderBy('crime.createdAt', 'DESC')
      .getMany();
  }

  async findAll(): Promise<Crime[]> {
    return this.crimeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Crime | null> {
    return this.crimeRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.crimeRepository.delete(id);
  }

  async updateStatus(id: string, status: VerificationStatus): Promise<Crime> {
    await this.crimeRepository.update(id, {
      verificationStatus: status,
    });
    const crime = await this.findById(id);
    if (!crime) {
      throw new Error('Crime not found');
    }
    return crime;
  }
}
