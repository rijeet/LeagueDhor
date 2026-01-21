import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../APP.Entity/person.entity';
import { CreatePersonDto } from '../../APP.Shared/dto/create-person.dto';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async create(data: CreatePersonDto & { id: string; slug: string }): Promise<Person> {
    const person = this.personRepository.create(data);
    return this.personRepository.save(person);
  }

  async findBySlug(slug: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Person | null> {
    return this.personRepository
      .createQueryBuilder('person')
      .where('LOWER(person.name) = LOWER(:name)', { name })
      .getOne();
  }

  async findWithLatestCrime(skip: number = 0, take: number = 10): Promise<{
    data: Array<{
      id: string;
      name: string;
      imageUrl?: string;
      slug: string;
      createdAt: Date;
      crimeCount: number;
      crimes: Array<{
        id: string;
        personId: string;
        location?: string;
        crimeImages: string[];
        sources: string[];
        profileUrl?: string;
        tags?: string[];
        verificationStatus: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>;
    total: number;
  }> {
    // Get total count
    const total = await this.personRepository.count();

    // Get paginated results
    const persons = await this.personRepository
      .createQueryBuilder('person')
      .leftJoinAndSelect('person.crimes', 'crime')
      .orderBy('person.createdAt', 'DESC')
      .addOrderBy('crime.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    const data = persons.map((person) => {
      // Get only the latest crime (first one after ordering)
      const latestCrime = person.crimes && person.crimes.length > 0 ? person.crimes[0] : null;
      const crimes = latestCrime ? [latestCrime] : [];

      return {
        id: person.id,
        name: person.name,
        imageUrl: person.imageUrl,
        slug: person.slug,
        createdAt: person.createdAt,
        crimeCount: person.crimes?.length || 0,
        crimes: crimes.map((crime) => ({
          id: crime.id,
          personId: crime.personId,
          location: crime.location,
          crimeImages: crime.crimeImages,
          sources: crime.sources,
          profileUrl: crime.profileUrl,
          tags: crime.tags || [],
          verificationStatus: crime.verificationStatus,
          createdAt: crime.createdAt,
          updatedAt: crime.updatedAt,
        })),
      };
    });

    return { data, total };
  }
}
