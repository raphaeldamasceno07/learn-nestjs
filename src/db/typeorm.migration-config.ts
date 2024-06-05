import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from './entities/user.entity';
import path from 'path';

config();

const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: +configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [__dirname + '/entities/**.{js,ts}'],
  migrations: [__dirname + '/migrations/**.{js,ts}'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
