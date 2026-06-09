import { v4 as uuidv4 } from 'uuid';
import { Db, MongoServerError } from 'mongodb';
import { User, CreateUserDto, UpdateUserProfileDto } from '../models/User';
import { IUserRepository, DuplicateUserError } from './IUserRepository';

const COLLECTION = 'users';
const DUP_KEY = 11000;

function classifyDuplicate(err: MongoServerError): DuplicateUserError {
  const msg = err.message || '';
  if (msg.includes('username')) return new DuplicateUserError('username');
  return new DuplicateUserError('email');
}

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    return this.db.collection<User>(COLLECTION).findOne({ id }) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.collection<User>(COLLECTION).findOne({ email: email.toLowerCase() }) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.collection<User>(COLLECTION).findOne({ username }) ?? null;
  }

  async create(dto: CreateUserDto): Promise<User> {
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
    try {
      await this.db.collection<User>(COLLECTION).insertOne(user);
      return user;
    } catch (err) {
      if (err instanceof MongoServerError && err.code === DUP_KEY) {
        throw classifyDuplicate(err);
      }
      throw err;
    }
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto): Promise<User | null> {
    const $set: Partial<User> = { updatedAt: new Date() };
    if (dto.username !== undefined) $set.username = dto.username;
    if (dto.avatarUrl !== undefined) $set.avatarUrl = dto.avatarUrl;
    try {
      const result = await this.db
        .collection<User>(COLLECTION)
        .findOneAndUpdate({ id }, { $set }, { returnDocument: 'after' });
      return result ?? null;
    } catch (err) {
      if (err instanceof MongoServerError && err.code === DUP_KEY) {
        throw classifyDuplicate(err);
      }
      throw err;
    }
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.db
      .collection<User>(COLLECTION)
      .updateOne({ id }, { $set: { passwordHash, updatedAt: new Date() } });
    return result.matchedCount === 1;
  }
}
