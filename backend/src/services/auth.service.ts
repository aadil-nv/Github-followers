import { injectable, inject } from "inversify";
import { IAuthService } from "./interfaces/auth.service.interface";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { UserResponseDTO } from "../dtos/user-response.dto";
import { CreateUserDTO } from "../dtos/create-user.dto";
import { IUserEntity } from "../interfaces/user.interface";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  async register(dto: CreateUserDTO): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDTO }> {    
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userToCreate: Partial<IUserEntity> = {
      ...dto,
      password: hashedPassword,
    };

    const createdUser = await this.userRepository.create(userToCreate as IUserEntity);

    const userResponse: UserResponseDTO = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role
    };

    // Generate tokens
    const accessToken = signAccessToken({ userId: createdUser.id, email: createdUser.email, role: createdUser.role });
    const refreshToken = signRefreshToken({ userId: createdUser.id, email: createdUser.email, role: createdUser.role });

    return { accessToken, refreshToken, user: userResponse };
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDTO }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid credentials");

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const userResponse: UserResponseDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(payload.userId);
      if (!user) throw new Error("User not found");

      const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
      return { accessToken };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

}
