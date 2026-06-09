import { v4 as uuidv4 } from 'uuid';
import { ShareToken, CreateShareTokenDto } from '../models/ShareToken';
import { IShareTokenRepository } from './IShareTokenRepository';

export class InMemoryShareTokenRepository implements IShareTokenRepository {
  private byToken = new Map<string, ShareToken>();
  private byMindmapId = new Map<string, ShareToken>();

  async findByToken(token: string): Promise<ShareToken | null> {
    return this.byToken.get(token) ?? null;
  }

  async findByMindmapId(mindmapId: string): Promise<ShareToken | null> {
    return this.byMindmapId.get(mindmapId) ?? null;
  }

  async create(dto: CreateShareTokenDto): Promise<ShareToken> {
    const shareToken: ShareToken = {
      token: uuidv4(),
      mindmapId: dto.mindmapId,
      createdAt: new Date(),
    };
    this.byToken.set(shareToken.token, shareToken);
    this.byMindmapId.set(shareToken.mindmapId, shareToken);
    return shareToken;
  }
}
