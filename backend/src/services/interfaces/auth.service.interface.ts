// src/services/interfaces/auth.service.interface.ts
import { CreateUserDTO } from "../../dtos/create-user.dto";
import { UserResponseDTO } from "../../dtos/user-response.dto";

export interface IAuthService {
  register(dto: CreateUserDTO): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDTO }>;
  login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDTO }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
}
