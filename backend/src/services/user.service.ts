import { inject, injectable } from 'inversify';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import jwt from 'jsonwebtoken';
import { IUserService } from './interfaces/user.service.interface';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { IUserEntity } from '../interfaces/user.interface';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private repository: IUserRepository
  ) {}

  async createUser(dto: CreateUserDTO): Promise<IUserEntity> {
    return this.repository.create(dto);
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<IUserEntity | null> {
    return this.repository.update(id, dto);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async getUserById(id: string): Promise<IUserEntity | null> {
    return this.repository.findById(id);
  }

  async getAllUsers(): Promise<IUserEntity[]> {
    return this.repository.findAll();
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: IUserEntity }> {
    const user = await this.repository.findByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'change_this_secret', { expiresIn: '1h' });
    return { accessToken: token, user };
  }
}
