import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import { config } from "./env";

dotenv.config(); // load .env

// export const sequelize = new Sequelize({
//   database: config.DB_NAME,
//   dialect: config.DB_DIALECT as any, // cast for TS
//   username: config.DB_USERNAME,
//   password: config.DB_PASSWORD,
//   host: config.DB_HOST,
//   port: Number(config.DB_PORT),
//   logging: config.DB_LOGGING,
//   models: [User],
// });

export const sequelize = new Sequelize({
  database: config.DB_NAME,
  dialect: config.DB_DIALECT as any, // TS cast
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  logging: config.DB_LOGGING, // convert string to boolean
  models: [User],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // important for Aiven SSL
    },
  },
});
