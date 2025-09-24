import { IUserEntity } from '../../interfaces/user.interface';
import { CreateUserDTO } from '../../dtos/create-user.dto';
import { UpdateUserDTO } from '../../dtos/update-user.dto';

export interface IUserService {
  saveUser(dto:IUserEntity): Promise<IUserEntity>;
  updateUser(username: string, dto: UpdateUserDTO): Promise<IUserEntity | null>;
  softDeleteUser(username: string): Promise<boolean>;
  getAllUsers(sortBy?: string): Promise<IUserEntity[]>;
  searchUsers(filters: any): Promise<IUserEntity[]>;
  findByUsername(username: string): Promise<IUserEntity | null>;
}
