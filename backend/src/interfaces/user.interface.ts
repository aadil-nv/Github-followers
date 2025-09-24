export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export interface IUserEntity {
  id: string;
  username: string;
  email?: string;
  password?: string;
  blog?: string;
  location?: string;
  bio?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  followers_url?: string;
  following_url?: string;
  avatar_url?: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
