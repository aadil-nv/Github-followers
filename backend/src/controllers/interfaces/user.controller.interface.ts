import { Request, Response, NextFunction } from 'express';

export interface IUserController {
  saveUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUser(req: Request, res: Response, next: NextFunction): Promise<void>;

   findMutualFriends(req: Request, res: Response, next: NextFunction): Promise<void>;
  searchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
}
