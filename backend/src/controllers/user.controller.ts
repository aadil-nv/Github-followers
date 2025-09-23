import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IUserController } from './interfaces/user.controller.interface';
import { IUserService } from '../services/interfaces/user.service.interface';

@injectable()
export class UserController implements IUserController {
  constructor(@inject('IUserService') private service: IUserService) {}

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    
    try {
      const username = req.body.username?.trim();
      console.log("Username received:", username);
      
      const user = await this.service.saveOrUpdateUser(username);
      res.json(user);
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
    console.log("Search method called================>>>>>>>>>>>>>>>>>>>>");
    
    try {
      const filters = req.query;
      console.log("Search filters received:", filters);
      
      const users = await this.service.searchUsers(filters);
      res.json(users);
    } catch (err) {
      console.log("Error in search method:", err);
      
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("GetAll method called================>>>>>>>>>>>>>>>>>>>>");
    
    try {
      const sortBy = req.query.sortBy as string;
      const users = await this.service.getAllUsers(sortBy);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
}
