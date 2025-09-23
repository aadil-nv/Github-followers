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

  async saveOrUpdateUser(username: string): Promise<IUserEntity> {
    // Check if user exists in DB
    let user = await this.repository.findByUsername(username);
    if (user) return user;

    // Fetch from GitHub API
    const { data } = await axios.get(`https://api.github.com/users/${username}`);
    const dto: CreateUserDTO = {
      username: data.login,
      blog: data.blog,
      location: data.location,
      bio: data.bio,
      public_repos: data.public_repos,
      public_gists: data.public_gists,
      followers: data.followers,
      following: data.following,
    };
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

  async searchUsers(filters: any): Promise<IUserEntity[]> {
    return this.repository.findAll(filters);
  }
}
