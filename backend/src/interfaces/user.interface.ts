export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export interface IUserEntity {
  id: string;
  username: string;
  name: string;
  email?: string;
  password?: string;
  blog?: string;
  location?: string;
  bio?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  deletedAt?: Date | null;
}
