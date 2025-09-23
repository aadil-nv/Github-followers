import { IBaseRepository } from '../repositories/interfaces/base.repository.interface';
import { IBaseService } from './interfaces/base.service.interface';

export abstract class BaseService<T, CreateDTO, UpdateDTO> implements IBaseService<T, CreateDTO, UpdateDTO> {
  protected repository: IBaseRepository<T, CreateDTO, UpdateDTO>;

  constructor(repository: IBaseRepository<T, CreateDTO, UpdateDTO>) {
    this.repository = repository;
  }

  getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  create(data: CreateDTO): Promise<T> {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateDTO): Promise<T | null> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
