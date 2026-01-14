import { HttpClient } from './http';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name?: string;
}

export class UserService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  async getAllUsers(): Promise<User[]> {
    return this.http.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.http.get<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.http.post<User>('/users', data);
  }
}
