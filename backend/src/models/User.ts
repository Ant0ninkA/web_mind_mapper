export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDto {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  passwordHash: string;
}

export function toUserDto(user: User): UserDto {
  const { passwordHash, ...dto } = user;
  return dto;
}
