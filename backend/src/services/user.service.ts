import { IUserService } from './interfaces/user.service.interface';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { injectable, inject } from 'inversify';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { IUserEntity } from '../interfaces/user.interface';
import axios from 'axios';
import { MutualFriend } from '../dtos/user-response.dto';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private repository: IUserRepository
  ) {}

  async saveUser(dto: IUserEntity): Promise<IUserEntity> {
    // Directly save the whole DTO
    return this.repository.save(dto);
  }

  async updateUser(username: string, dto: UpdateUserDTO): Promise<IUserEntity | null> {
    return this.repository.update(username, dto);
  }

  async softDeleteUser(username: string): Promise<boolean> {
    return this.repository.softDelete(username);
  }

  async getAllUsers(sortBy?: string): Promise<IUserEntity[]> {
    return this.repository.findAll({}, sortBy);
  }

 async searchUsers(filters: any, sortBy?: string): Promise<IUserEntity[]> {
    return this.repository.findAll(filters, sortBy);
  }
  async findByUsername(username: string): Promise<IUserEntity | null> {
  return this.repository.findByUsername(username);
}

 async  findMutualFriends(username: string): Promise<MutualFriend[]> {
  // Fetch followers
  const followersRes = await axios.get<{ login: string; avatar_url: string }[]>(`${process.env.GITHUB_API_URL}/users/${username}/followers`);
  const followers = followersRes.data;

  // Fetch following
  const followingRes = await axios.get<{ login: string; avatar_url: string }[]>(`${process.env.GITHUB_API_URL}/users/${username}/following`);
  const following = followingRes.data;

  // Find mutuals
  const mutual: MutualFriend[] = followers
    .filter(f => following.some(fw => fw.login === f.login))
    .map(f => ({
      login: f.login,
      username: f.login,
      avatar_url: f.avatar_url,
    }));

    

  return mutual;
}


}
