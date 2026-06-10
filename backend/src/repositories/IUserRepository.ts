import { User, CreateUserDto } from '../models/User';

export class DuplicateUserError extends Error {
  constructor(public readonly field: 'email' | 'username') {
    super(`User with that ${field} already exists`);
    this.name = 'DuplicateUserError';
  }
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(dto: CreateUserDto): Promise<User>;
}
