import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserDto } from '../models/User';
import { IUserRepository, DuplicateUserError } from './IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private byId = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase();
    for (const u of this.byId.values()) {
      if (u.email === target) return u;
    }
    return null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(dto.email)) throw new DuplicateUserError('email');
    for (const u of this.byId.values()) {
      if (u.username === dto.username) throw new DuplicateUserError('username');
    }
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: dto.email.toLowerCase(),
      username: dto.username,
      passwordHash: dto.passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(user.id, user);
    return user;
  }
}
