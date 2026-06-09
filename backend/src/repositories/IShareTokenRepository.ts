import { ShareToken, CreateShareTokenDto } from '../models/ShareToken';

export interface IShareTokenRepository {
  findByToken(token: string): Promise<ShareToken | null>;
  findByMindmapId(mindmapId: string): Promise<ShareToken | null>;
  create(dto: CreateShareTokenDto): Promise<ShareToken>;
}
