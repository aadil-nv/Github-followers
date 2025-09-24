import { IUserEntity } from '../../interfaces/user.interface';
import { CreateUserDTO } from '../../dtos/create-user.dto';
import { UpdateUserDTO } from '../../dtos/update-user.dto';
import { MutualFriend } from '../../dtos/user-response.dto';

export interface IUserService {
  saveUser(dto:IUserEntity): Promise<IUserEntity>;
  updateUser(username: string, dto: UpdateUserDTO): Promise<IUserEntity | null>;
  softDeleteUser(username: string): Promise<boolean>;
  getAllUsers(sortBy?: string): Promise<IUserEntity[]>;
    searchUsers(filters: any, sortBy?: string): Promise<IUserEntity[]>;

  findByUsername(username: string): Promise<IUserEntity | null>;

   findMutualFriends(username: string): Promise<MutualFriend[]>;
}
