import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { v4 } from 'uuid';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { LoginDTO } from '@src/auth/dto/login.dto';
import { RegisterDTO } from '@src/auth/dto/register.dto';
import { UtilService } from '@src/util/util.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly utilService: UtilService
  ) {}

  async register(input: RegisterDTO) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [existingUser] = await trx('users')
          .select('*')
          .where('email', '=', input.email)
          .orWhere('username', '=', input.username);

        if (existingUser) {
          throw new ConflictException('Email or username not available');
        }

        const hashedPassword = await hash(input.password);

        const userId = v4();

        const [user] = await trx('users')
          .insert({
            id: userId,
            email: input.email,
            username: input.username,
            password: hashedPassword,
          })
          .returning(['id', 'email', 'username']);

        const tokenId = v4();

        const tokenValue = await this.utilService.generateRandomToken();

        const [accessToken] = await trx('user_tokens')
          .insert({
            id: tokenId,
            value: tokenValue,
            context: 'access',
            userId: userId,
          })
          .returning(['value', 'context']);

        await trx.commit([user, accessToken]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return {
      user: result[0],
      accessToken: result[1].value,
    };
  }

  async login(input: LoginDTO) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users')
          .select(['id', 'username', 'email', 'password'])
          .where('email', '=', input.email);

        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const match = await verify(user.password, input.password);

        if (!match) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const tokenId = v4();

        const tokenValue = await this.utilService.generateRandomToken();

        const [accessToken] = await trx('user_tokens')
          .insert({
            id: tokenId,
            value: tokenValue,
            context: 'access',
            userId: user.id,
          })
          .returning(['value', 'context']);

        await trx.commit([user, accessToken]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    const { password, ...returningUser } = result[0];

    return {
      user: returningUser,
      accessToken: result[1].value,
    };
  }

  async logout(token: string) {
    try {
      await this.knex('user_tokens')
        .delete()
        .where('value', '=', token)
        .andWhere('context', '=', 'access');

      return true;
    } catch (error) {
      return false;
    }
  }

  async logoutFromAllDevices(token: string) {
    try {
      const subquery = this.knex('user_tokens')
        .select('userId')
        .where('value', '=', token);

      await this.knex('user_tokens')
        .delete()
        .where('userId', '=', subquery)
        .andWhere('context', '=', 'access');

      return true;
    } catch (error) {
      return false;
    }
  }
}
