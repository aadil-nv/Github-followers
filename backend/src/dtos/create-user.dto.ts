import { UserRole } from "../interfaces/user.interface";

export class CreateUserDTO {
  username!: string;
  email?: string;
  password?: string;
  blog?: string
  location?: string;
  bio?: string
  public_repos?: number;
  public_gists?: number
  followers?: number;
  following?: number;
  followers_url?: string;
  following_url?: string;
  avatar_url?: string;
  repos_url?: string;
}
