import { HttpClient } from './http';

export interface CreateCrimeDto {
  personId?: string;
  person?: {
    name: string;
    imageUrl?: string;
  };
  location?: string;
  crimeImages: string[];
  sources: string[];
  profileUrl?: string;
  tags?: string[];
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

export class CrimeService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  async create(data: CreateCrimeDto): Promise<Crime> {
    return this.http.post<Crime>('/crimes', data);
  }

  async getByPersonSlug(slug: string): Promise<Crime[]> {
    return this.http.get<Crime[]>(`/crimes/person/${slug}`);
  }
}
