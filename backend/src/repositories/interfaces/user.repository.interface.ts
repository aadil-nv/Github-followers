import { CreateUserDTO } from "../../dtos/create-user.dto";
import { UpdateUserDTO } from "../../dtos/update-user.dto";
import { IUserEntity } from "../../interfaces/user.interface";


export interface IUserRepository {
  create(data: CreateUserDTO): Promise<IUserEntity>;
  update(id: string, data: UpdateUserDTO): Promise<IUserEntity | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<IUserEntity | null>;
  findByEmail(email: string): Promise<IUserEntity | null>;
  findAll(): Promise<IUserEntity[]>;
}
