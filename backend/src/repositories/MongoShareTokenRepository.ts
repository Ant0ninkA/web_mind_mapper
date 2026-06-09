import { v4 as uuidv4 } from 'uuid';
import { Db } from 'mongodb';
import { ShareToken, CreateShareTokenDto } from '../models/ShareToken';
import { IShareTokenRepository } from './IShareTokenRepository';

const COLLECTION = 'share_tokens';

export class MongoShareTokenRepository implements IShareTokenRepository {
  constructor(private readonly db: Db) {}

  async findByToken(token: string): Promise<ShareToken | null> {
    return this.db.collection<ShareToken>(COLLECTION).findOne({ token }) ?? null;
  }

  async findByMindmapId(mindmapId: string): Promise<ShareToken | null> {
    return this.db.collection<ShareToken>(COLLECTION).findOne({ mindmapId }) ?? null;
  }

  async create(dto: CreateShareTokenDto): Promise<ShareToken> {
    const shareToken: ShareToken = {
      token: uuidv4(),
      mindmapId: dto.mindmapId,
      createdAt: new Date(),
    };
    await this.db.collection<ShareToken>(COLLECTION).insertOne(shareToken);
    return shareToken;
  }
}
