import { IUserService } from './interfaces/user.service.interface';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { injectable, inject } from 'inversify';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { IUserEntity } from '../interfaces/user.interface';
import axios from 'axios';

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

async findMutualFriends(username: string): Promise<string[]> {
    // Fetch followers
    const followersRes = await axios.get(`https://api.github.com/users/${username}/followers`);
    const followers = followersRes.data.map((f: any) => f.login);

    // Fetch following
    const followingRes = await axios.get(`https://api.github.com/users/${username}/following`);
    const following = followingRes.data.map((f: any) => f.login);

    // Mutual = intersection
    const mutual = followers.filter((f: string) => following.includes(f));
    return mutual;
  }


}
