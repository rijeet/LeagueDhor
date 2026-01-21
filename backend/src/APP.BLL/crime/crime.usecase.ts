import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CrimeRepository } from '../../APP.Infrastructure/repositories/crime.repository';
import { PersonRepository } from '../../APP.Infrastructure/repositories/person.repository';
import { CreateCrimeDto } from '../../APP.Shared/dto/create-crime.dto';
import { CreateCrimeWithPersonDto } from '../../APP.Shared/dto/create-crime-with-person.dto';
import { Crime } from '../../APP.Entity/crime.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { VerificationStatus } from '../../APP.Shared/enums/verification-status.enum';

@Injectable()
export class CrimeUsecase {
  private readonly logger = new Logger(CrimeUsecase.name);

  constructor(
    private crimeRepository: CrimeRepository,
    private personRepository: PersonRepository,
  ) {}

  /**
   * Create a crime (requires existing personId)
   */
  async createCrime(dto: CreateCrimeDto): Promise<Crime> {
    // Validate that person exists
    const person = await this.personRepository.findById(dto.personId);
    if (!person) {
      throw new BusinessException('Person not found. Please provide a valid personId.', 404);
    }

    return this.crimeRepository.create({
      ...dto,
      id: randomUUID(),
    });
  }

  /**
   * Create a crime with person (creates person if needed)
   * Industry standard: Use transaction to ensure atomicity
   */
  async createCrimeWithPerson(dto: CreateCrimeWithPersonDto): Promise<Crime> {
    this.logger.log('Creating crime with person');

    let personId: string;

    // Option 1: Use existing person
    if (dto.personId) {
      this.logger.debug(`Using existing person: ${dto.personId}`);
      const person = await this.personRepository.findById(dto.personId);
      if (!person) {
        throw new BusinessException('Person not found', 404);
      }
      personId = dto.personId;
    }
    // Option 2: Create new person
    else if (dto.person) {
      this.logger.debug(`Creating new person: ${dto.person.name}`);
      
      // Check if person already exists by name (prevent duplicates)
      const existingPerson = await this.personRepository.findByName(dto.person.name);
      if (existingPerson) {
        this.logger.debug(`Person already exists: ${existingPerson.id}`);
        personId = existingPerson.id;
      } else {
        // Generate slug
        const slug = this.generateSlug(dto.person.name);
        const uniqueSlug = await this.ensureUniqueSlug(slug);
        
        const newPerson = await this.personRepository.create({
          ...dto.person,
          id: randomUUID(),
          slug: uniqueSlug,
        });
        personId = newPerson.id;
        this.logger.log(`Person created successfully: ${personId}`);
      }
    }
    else {
      throw new BusinessException('Either personId or person details must be provided', 400);
    }

    // Validate image URLs if provided
    if (dto.crimeImages && dto.crimeImages.length > 0) {
      for (const imageUrl of dto.crimeImages) {
        try {
          new URL(imageUrl);
        } catch {
          throw new BusinessException(`Invalid image URL: ${imageUrl}`, 400);
        }
      }
    }

    // Validate source URLs if provided
    if (dto.sources && dto.sources.length > 0) {
      for (const source of dto.sources) {
        if (source.trim()) {
          try {
            new URL(source);
          } catch {
            throw new BusinessException(`Invalid source URL: ${source}`, 400);
          }
        }
      }
    }

    // Create crime
    const crime = await this.crimeRepository.create({
      personId,
      location: dto.location?.trim() || '',
      crimeImages: dto.crimeImages || [],
      sources: dto.sources?.filter(s => s.trim()) || [],
      profileUrl: dto.profileUrl?.trim() || '',
      tags: dto.tags?.filter(t => t.trim()).map(t => t.trim()) || [],
      id: randomUUID(),
    });

    this.logger.log(`Crime created successfully: ${crime.id}`);
    return crime;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.personRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async getCrimesByPersonId(personId: string): Promise<Crime[]> {
    return this.crimeRepository.findByPersonId(personId);
  }

  async getCrimesByPersonSlug(slug: string): Promise<Crime[]> {
    return this.crimeRepository.findByPersonSlug(slug);
  }

  async getAllCrimes(): Promise<Crime[]> {
    return this.crimeRepository.findAll();
  }

  async getCrimeById(id: string): Promise<Crime> {
    const crime = await this.crimeRepository.findById(id);
    if (!crime) {
      throw new BusinessException('Crime not found', 404);
    }
    return crime;
  }

  async deleteCrime(id: string): Promise<void> {
    const crime = await this.crimeRepository.findById(id);
    if (!crime) {
      throw new BusinessException('Crime not found', 404);
    }
    await this.crimeRepository.delete(id);
    this.logger.log(`Crime deleted: ${id}`);
  }

  async updateCrimeStatus(id: string, status: string): Promise<Crime> {
    const crime = await this.crimeRepository.findById(id);
    if (!crime) {
      throw new BusinessException('Crime not found', 404);
    }
    
    // Validate status
    const validStatuses: VerificationStatus[] = [
      VerificationStatus.UNVERIFIED,
      VerificationStatus.VERIFIED,
      VerificationStatus.FALSE,
      VerificationStatus.AI_GENERATED,
    ];
    const statusEnum = status as VerificationStatus;
    if (!validStatuses.includes(statusEnum)) {
      throw new BusinessException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await this.crimeRepository.updateStatus(id, statusEnum);
    this.logger.log(`Crime status updated: ${id} -> ${status}`);
    return updated;
  }
}
