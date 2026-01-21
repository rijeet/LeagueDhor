import { HttpClient } from './http';

export interface Person {
  id: string;
  name: string;
  imageUrl?: string;
  slug: string;
  createdAt: string;
}

export interface PersonFeedItem {
  person: Person;
  latestCrime?: Crime | null;
  crimeCount?: number;
}

export interface Crime {
  id: string;
  personId: string;
  location?: string;
  crimeImages: string[];
  sources: string[];
  profileUrl?: string;
  tags?: string[];
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';
  createdAt: string;
  updatedAt: string;
}

export class PersonService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  async getFeed(page: number = 1, limit: number = 10): Promise<{
    data: PersonFeedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    return this.http.get<{
      data: PersonFeedItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
      };
    }>(`/persons/feed?page=${page}&limit=${limit}`);
  }

  async getBySlug(slug: string): Promise<Person> {
    return this.http.get<Person>(`/persons/${slug}`);
  }

  async getById(id: string): Promise<Person> {
    return this.http.get<Person>(`/persons/id/${id}`);
  }
}
