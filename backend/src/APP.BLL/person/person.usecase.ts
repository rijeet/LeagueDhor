import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonRepository } from '../../APP.Infrastructure/repositories/person.repository';
import { CreatePersonDto } from '../../APP.Shared/dto/create-person.dto';
import { Person } from '../../APP.Entity/person.entity';
import { PersonFeedItemDto } from '../../APP.Shared/dto/person-feed-item.dto';
import { Crime } from '../../APP.Entity/crime.entity';
import { VerificationStatus } from '../../APP.Shared/enums/verification-status.enum';

@Injectable()
export class PersonUsecase {
  constructor(private personRepository: PersonRepository) {}

  /**
   * Generate a URL-safe slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Create a new person or return existing one by name
   */
  async createPerson(dto: CreatePersonDto): Promise<Person> {
    // Check if person already exists by name (case-insensitive)
    const existing = await this.personRepository.findByName(dto.name);
    if (existing) {
      return existing;
    }

    // Generate unique slug
    const baseSlug = this.generateSlug(dto.name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.personRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.personRepository.create({
      ...dto,
      id: randomUUID(),
      slug,
    });
  }

  async getBySlug(slug: string): Promise<Person | null> {
    return this.personRepository.findBySlug(slug);
  }

  async getById(id: string): Promise<Person | null> {
    return this.personRepository.findById(id);
  }

  async getFeed(page: number = 1, limit: number = 10): Promise<{
    data: PersonFeedItemDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    const { data: rawData, total } = await this.personRepository.findWithLatestCrime(skip, limit);
    
    // Transform the TypeORM result to match expected format
    const data = rawData.map((row: {
      id: string;
      name: string;
      imageUrl?: string;
      slug: string;
      createdAt: Date;
      crimeCount?: number;
      crimes?: Array<{
        id: string;
        personId: string;
        location?: string;
        crimeImages: string[];
        sources: string[];
        profileUrl?: string;
        tags?: string[];
        verificationStatus: string;
        createdAt: Date;
        updatedAt?: Date;
      }>;
    }) => {
      const person: Person = {
        id: row.id,
        name: row.name,
        imageUrl: row.imageUrl,
        slug: row.slug,
        createdAt: row.createdAt,
        crimes: [],
      };

      // Extract latest crime from crimes array (json_agg returns array)
      let latestCrime: Crime | null = null;
      
      if (row.crimes && Array.isArray(row.crimes) && row.crimes.length > 0) {
        const crimeData = row.crimes[0]; // Get first crime (already ordered by createdAt DESC)
        if (crimeData && crimeData.id) {
          latestCrime = {
            id: crimeData.id,
            personId: crimeData.personId,
            location: crimeData.location,
            crimeImages: crimeData.crimeImages || [],
            sources: crimeData.sources || [],
            profileUrl: crimeData.profileUrl,
            tags: crimeData.tags || [],
            verificationStatus: crimeData.verificationStatus as VerificationStatus,
            createdAt: crimeData.createdAt,
            updatedAt: crimeData.updatedAt || crimeData.createdAt,
            person: person, // Add person relation
          };
        }
      }

      // Parse crimeCount
      const rawCount = row.crimeCount !== undefined ? row.crimeCount : null;
      let crimeCount = 0;
      
      if (rawCount !== undefined && rawCount !== null) {
        const parsed = typeof rawCount === 'string' ? parseInt(rawCount, 10) : Number(rawCount);
        crimeCount = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }

      return {
        person,
        latestCrime,
        crimeCount,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }
}
