import { UserRole } from "../interfaces/user.interface";

export class CreateUserDTO {
  email!: string;
  password!: string;
  role?: UserRole;
  name!: string;
}
