import { CreateUserDTO } from '../../dtos/create-user.dto';
import { UpdateUserDTO } from '../../dtos/update-user.dto';
import { IUserEntity } from '../../interfaces/user.interface';

export interface IUserRepository {
  save(user: CreateUserDTO): Promise<IUserEntity>;
  update(username: string, dto: UpdateUserDTO): Promise<IUserEntity | null>;
  softDelete(username: string): Promise<boolean>;
  findByUsername(username: string): Promise<IUserEntity | null>;
  findAll(filters?: any, sortBy?: string): Promise<IUserEntity[]>;
}
