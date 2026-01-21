import { HttpClient } from './http';

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

export interface UpdateCrimeStatusDto {
  status: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';
}

export class AdminService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  async getAllCrimes(): Promise<Crime[]> {
    return this.http.get<Crime[]>('/crimes/admin/all');
  }

  async getCrimeById(id: string): Promise<Crime> {
    return this.http.get<Crime>(`/crimes/admin/${id}`);
  }

  async deleteCrime(id: string): Promise<void> {
    return this.http.delete<void>(`/crimes/admin/${id}`);
  }

  async updateCrimeStatus(id: string, status: UpdateCrimeStatusDto['status']): Promise<Crime> {
    return this.http.patch<Crime>(`/crimes/admin/${id}/status`, { status });
  }
}
