import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('follows', (t) => {
    t.uuid('id', { primaryKey: true });

    t.uuid('followerId').notNullable().index();
    t.foreign('followerId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    t.uuid('followeeId').notNullable().index();
    t.foreign('followeeId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    t.unique(['followerId', 'followeeId'], {
      indexName: 'follower_followee_unique',
    });

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('follows');
}
