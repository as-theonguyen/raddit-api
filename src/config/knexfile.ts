import { join } from 'path';
import type { Knex } from 'knex';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'raddit_dev',
      user: 'postgres',
      password: 'postgres',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: join(__dirname, '..', 'db', 'migrations'),
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'raddit_test',
      user: 'postgres',
      password: 'postgres',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: join(__dirname, '..', 'db', 'migrations'),
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: join(__dirname, '..', 'db', 'migrations'),
    },
  },
};

export default knexConfig;
