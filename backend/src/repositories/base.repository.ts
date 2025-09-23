export class BaseRepository<T> {
  constructor(private model: any) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).lean();
  }

  async findAll(filter: object = {}, options: object = {}): Promise<T[]> {
    return await this.model.find(filter, null, options).lean();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
