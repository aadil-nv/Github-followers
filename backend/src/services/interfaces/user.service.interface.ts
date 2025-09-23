import { CreateUserDTO } from "../../dtos/create-user.dto";
import { UpdateUserDTO } from "../../dtos/update-user.dto";
import { IUserEntity } from "../../interfaces/user.interface";

export interface IUserService {
  createUser(dto: CreateUserDTO): Promise<IUserEntity>;
  updateUser(id: string, dto: UpdateUserDTO): Promise<IUserEntity | null>;
  deleteUser(id: string): Promise<boolean>;
  getUserById(id: string): Promise<IUserEntity | null>;
  getAllUsers(): Promise<IUserEntity[]>;
  login(email: string, password: string): Promise<{ accessToken: string; user: IUserEntity }>;
}
