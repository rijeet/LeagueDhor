import { Injectable } from '@nestjs/common';
import { PersonUsecase } from './person.usecase';
import { Person } from '../../APP.Entity/person.entity';
import { PersonFeedItemDto } from '../../APP.Shared/dto/person-feed-item.dto';

@Injectable()
export class PersonService {
  constructor(private personUsecase: PersonUsecase) {}

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
    return this.personUsecase.getFeed(page, limit);
  }

  async getBySlug(slug: string): Promise<Person | null> {
    return this.personUsecase.getBySlug(slug);
  }

  async getById(id: string): Promise<Person | null> {
    return this.personUsecase.getById(id);
  }
}
