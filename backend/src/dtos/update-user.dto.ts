import { UserRole } from "../interfaces/user.interface";

export class UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
}
