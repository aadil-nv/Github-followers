import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { LoginDTO } from '../dtos/login.dto';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { LoginResponseDTO } from '../dtos/login-response.dto';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { IUserService } from '../services/interfaces/user.service.interface';
import { IUserController } from './interfaces/user.controller.interface';
import { HttpStatusCode } from '../constants/http-status-code.enum';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService') private service: IUserService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    
    const dto = req.body as CreateUserDTO;
    const user = await this.service.createUser(dto);
    const response: UserResponseDTO = { ...user } as UserResponseDTO;
    res.status(201).json(response);
  }

  async update(req: Request, res: Response): Promise<void> {
    const dto = req.body as UpdateUserDTO;
    const user = await this.service.updateUser(req.params.id, dto);
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const success = await this.service.deleteUser(req.params.id);
    if (!success) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'User not found' });
      return;
    }
    res.status(HttpStatusCode.NO_CONTENT).send();
  }

  async getById(req: Request, res: Response): Promise<void> {
    const user = await this.service.getUserById(req.params.id);
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const users = await this.service.getAllUsers();
    res.json(users);
  }

  async login(req: Request, res: Response): Promise<void> {
    const dto = req.body as LoginDTO;
    const {user} = await this.service.login(dto.email, dto.password);
    const response: LoginResponseDTO = {
      user: { ...user } as UserResponseDTO
    };
    res.json(response);
  }
}
