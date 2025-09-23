import { Request, Response } from 'express';
import { HttpStatusCode } from '../constants/http-status-code.enum';
import { IBaseController } from './interfaces/base.controller.interface';
import { IBaseService } from '../services/interfaces/base.service.interface';

export abstract class BaseController<T, CreateDTO, UpdateDTO> implements IBaseController {
  protected service: IBaseService<T, CreateDTO, UpdateDTO>;

  constructor(service: IBaseService<T, CreateDTO, UpdateDTO>) {
    this.service = service;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    const items = await this.service.getAll();
    res.status(HttpStatusCode.OK).json(items);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Not found' });
      return;
    }
    res.status(HttpStatusCode.OK).json(item);
  }

  async create(req: Request, res: Response): Promise<void> {
    const created = await this.service.create(req.body);
    res.status(HttpStatusCode.CREATED).json(created);
  }

  async update(req: Request, res: Response): Promise<void> {
    const updated = await this.service.update(req.params.id, req.body);
    if (!updated) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Not found' });
      return;
    }
    res.status(HttpStatusCode.OK).json(updated);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await this.service.delete(req.params.id);
    if (!deleted) {
      res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Not found' });
      return;
    }
    res.status(HttpStatusCode.NO_CONTENT).send();
  }
}
