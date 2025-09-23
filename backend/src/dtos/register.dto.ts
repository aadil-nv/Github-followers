import { UserRole } from "../interfaces/user.interface";

export class RegisterDTO {
  email!: string;
  password!: string;
  role?: UserRole; 
  name!: string;
}
