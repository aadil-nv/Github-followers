export enum UserRole {
  Admin = "admin",
  User = "user",
  Manager = "manager"
}

export interface IUserEntity {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
