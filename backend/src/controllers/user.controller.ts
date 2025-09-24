import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IUserController } from './interfaces/user.controller.interface';
import { IUserService } from '../services/interfaces/user.service.interface';

@injectable()
export class UserController implements IUserController {
  constructor(@inject('IUserService') private service: IUserService) {}

  async saveUser(req: Request, res: Response, next: NextFunction): Promise<void> {    
  try {
    const dto = req.body; 
    const user = await this.service.saveUser(dto);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username?.trim();
      const dto = req.body;
      const updated = await this.service.updateUser(username, dto);
      if (!updated) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username?.trim();
      const success = await this.service.softDeleteUser(username);
      if (!success) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    
    try {
      const filters = req.query;
      const users = await this.service.searchUsers(filters);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sortBy = req.query.sortBy as string;
      const users = await this.service.getAllUsers(sortBy);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const name = req.params.name?.trim();
    if (!name) {
      res.status(400).json({ message: 'Username is required' });
      return;
    }

    const user = await this.service.findByUsername(name); 
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async findMutualFriends(req: Request, res: Response, next: NextFunction): Promise<void> {  
    try {
      const username = req.params.username;
      const mutual = await this.service.findMutualFriends(username);
          console.log("Mutual friends found:", mutual);

      res.json({  mutual });
    } catch (err) {
      next(err);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;
      const sortBy = req.query.sortBy as string;
      const users = await this.service.searchUsers(filters, sortBy);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }


}
