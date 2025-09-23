import { UserRole } from "../interfaces/user.interface";

export class UserResponseDTO {
  id!: string;
  email!: string;
  name!: string;
  role!: UserRole;
  accessToken?: string;
  refreshToken?: string;
}
