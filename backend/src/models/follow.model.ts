import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "follows", timestamps: true })
export class Follow extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING }) // username instead of ID
  follower!: string; // who follows

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING }) // username instead of ID
  following!: string; // who is being followed
}
