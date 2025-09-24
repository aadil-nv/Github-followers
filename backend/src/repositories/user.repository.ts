import { IUserRepository } from './interfaces/user.repository.interface';
import { IUserEntity } from '../interfaces/user.interface';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { User } from '../models/user.model';

export class UserRepository implements IUserRepository {
  async save(dto: IUserEntity): Promise<IUserEntity> {
    // Directly save the entire object
    const [user] = await User.findOrCreate({
      where: { username: dto.username },
      defaults: { ...dto }, // save all fields
    });
    return user.get() as IUserEntity;
  }

  async update(username: string, dto: UpdateUserDTO): Promise<IUserEntity | null> {
    const trimmedUsername = username.trim();
    const user = await User.findOne({ where: { username: trimmedUsername, isDeleted: false } });
    if (!user) return null;

    await user.update(dto);
    return user.get() as IUserEntity;
  }

  async softDelete(username: string): Promise<boolean> {
    const trimmedUsername = username.trim();
    const user = await User.findOne({ where: { username: trimmedUsername, isDeleted: false } });
    if (!user) return false;

    await user.update({ isDeleted: true });
    return true;
  }

  async findByUsername(username: string): Promise<IUserEntity | null> {
    const trimmedUsername = username.trim();
    const user = await User.findOne({ where: { username: trimmedUsername, isDeleted: false } });
    return user ? (user.get() as IUserEntity) : null;
  }

  async findAll(filters?: any, sortBy?: string): Promise<IUserEntity[]> {
    console.log("Finding all users with filters:", filters, "and sortBy:", sortBy);
    
    const users = await User.findAll({
      where: { ...filters, isDeleted: false },
      order: sortBy ? [[sortBy, 'DESC']] : undefined,
    });
    return users.map(u => u.get() as IUserEntity);
  }

  
}
