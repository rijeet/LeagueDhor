import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  // Note: id is NOT included here - it will be generated in the usecase
  anonymousName?: string;
  email!: string;
  passwordHash!: string;
  role!: UserRole;
}
