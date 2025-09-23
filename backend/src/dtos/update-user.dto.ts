import { UserRole } from "../interfaces/user.interface";

export class UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  blog?: string | null;
  location?: string | null;
  bio?: string | null;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  role?: UserRole;
}
