import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserDto, UpdateUserProfileDto } from '../models/User';
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

  async findByUsername(username: string): Promise<User | null> {
    for (const u of this.byId.values()) {
      if (u.username === username) return u;
    }
    return null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(dto.email)) throw new DuplicateUserError('email');
    if (await this.findByUsername(dto.username)) throw new DuplicateUserError('username');
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: dto.email.toLowerCase(),
      username: dto.username,
      passwordHash: dto.passwordHash,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(user.id, user);
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto): Promise<User | null> {
    const existing = this.byId.get(id);
    if (!existing) return null;
    if (dto.username !== undefined && dto.username !== existing.username) {
      const taken = await this.findByUsername(dto.username);
      if (taken && taken.id !== id) throw new DuplicateUserError('username');
    }
    const updated: User = {
      ...existing,
      ...(dto.username !== undefined && { username: dto.username }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      updatedAt: new Date(),
    };
    this.byId.set(id, updated);
    return updated;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    const existing = this.byId.get(id);
    if (!existing) return false;
    this.byId.set(id, { ...existing, passwordHash, updatedAt: new Date() });
    return true;
  }
}
