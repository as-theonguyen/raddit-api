import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { FindOneDTO } from '@src/user/dto/find-one-user.dto';
import { UpdateUserDTO } from '@src/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findOne(query: FindOneDTO) {
    const [user] = await this.knex('users').select('*').where(query);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByToken(token: string, context: string = 'access') {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .join('user_tokens as t', 'u.id', '=', 't.userId')
      .where('t.value', '=', token)
      .andWhere('t.context', '=', context);

    if (!user) {
      return null;
    }

    return user;
  }

  async updateOne(id: string, { currentPassword, ...input }: UpdateUserDTO) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users').select('*').where('id', '=', id);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const match = await verify(user.password, currentPassword);

        if (!match) {
          throw new UnauthorizedException('Invalid credentials');
        }

        let newPassword: string | null | undefined;

        if (input.password) {
          newPassword = await hash(input.password);
        }

        const [updatedUser] = await trx('users')
          .update({
            ...input,
            password: newPassword,
          })
          .where('id', '=', id)
          .returning('*');

        await trx.commit([updatedUser]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return result[0];
  }

  async deleteOne(id: string) {
    try {
      await this.knex('users').delete().where('id', '=', id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
