import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (t) => {
    t.uuid('id', { primaryKey: true });
    t.string('username').notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('password').notNullable();

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
