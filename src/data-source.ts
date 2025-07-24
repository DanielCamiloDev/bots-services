import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { DataSource } from 'typeorm';
import 'dotenv/config'

export const AppDataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  synchronize: true,
};

export const AppDataSource = new DataSource(AppDataSourceOptions);