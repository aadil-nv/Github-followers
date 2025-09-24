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

  @Column({ type: DataType.STRING })
  avatar_url?: string; // avatar URL

  @Column({ type: DataType.STRING })
  followers_url?: string; // followers link

  @Column({ type: DataType.STRING })
  following_url?: string; // following link

  @Column({ type: DataType.STRING })
  repos_url?: string; // ✅ added repos_url

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  public_repos!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  public_gists!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  followers!: number; // follower count

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  following!: number; // following count

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDeleted!: boolean;
}
