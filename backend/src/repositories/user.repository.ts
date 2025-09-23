import { injectable } from 'inversify';
import { IUserRepository } from './interfaces/user.repository.interface';
import { IUserEntity, UserRole } from '../interfaces/user.interface';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDTO } from '../dtos/update-user.dto';



@injectable()
export class UserRepository implements IUserRepository {
  private users: IUserEntity[] = [];

  async create(data: CreateUserDTO): Promise<IUserEntity> {
    const newUser: IUserEntity = {
      id: uuidv4(),
      email: data.email,
      name: data.name,
      password: data.password, 
      role: data.role || UserRole.User,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUserEntity | null> {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, data, { updatedAt: new Date() });
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async findById(id: string): Promise<IUserEntity | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<IUserEntity | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async findAll(): Promise<IUserEntity[]> {
    return this.users;
  }
}
