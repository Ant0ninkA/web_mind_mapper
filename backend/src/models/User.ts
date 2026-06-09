export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDto {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  passwordHash: string;
}

export interface UpdateUserProfileDto {
  username?: string;
  avatarUrl?: string | null;
}

export function toUserDto(user: User): UserDto {
  const { passwordHash, ...dto } = user;
  return dto;
}
