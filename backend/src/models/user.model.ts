import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4) // auto-generate UUID
  @Column({ type: DataType.UUID })
  id!: string;

  @Column({ type: DataType.STRING })
  username!: string;

  @Column({ type: DataType.STRING })
  location?: string;

  @Column({ type: DataType.STRING })
  blog?: string;

  @Column({ type: DataType.STRING })
  bio?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  public_repos!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  public_gists!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  followers!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  following!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDeleted!: boolean;
}
