export interface ShareToken {
  token: string;
  mindmapId: string;
  createdAt: Date;
}

export interface CreateShareTokenDto {
  mindmapId: string;
}
