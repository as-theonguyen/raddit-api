import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { hash } from 'argon2';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { AuthService } from '@src/auth/auth.service';
import { UtilModule } from '@src/util/util.module';

describe('AuthService', () => {
  let authService: AuthService;
  let knex: Knex;

  const user = userFactory.build();
  const tokens = tokenFactory
    .params({
      context: 'access',
      userId: user.id,
    })
    .buildList(4);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test), UtilModule],
      providers: [AuthService],
    }).compile();

    authService = module.get(AuthService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert({
      ...user,
      password: await hash(user.password),
    });
    await knex('user_tokens').insert(tokens);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('register', () => {
    it('should create the user and token in the database', async () => {
      const { id, ...registerData } = userFactory.build();
      const result = await authService.register(registerData);

      expect(result.user).toMatchObject({
        email: registerData.email,
        username: registerData.username,
      });
      expect(result.accessToken).toBeDefined();

      const [accessTokenInDb] = await knex('user_tokens')
        .select('userId')
        .where('value', '=', result.accessToken)
        .andWhere('context', '=', 'access');

      expect(accessTokenInDb).toBeDefined();
      expect(accessTokenInDb.userId).toBe(result.user.id);

      const [userInDb] = await knex('users')
        .select('password')
        .where('id', '=', result.user.id);

      expect(userInDb).toBeDefined();
      expect(userInDb.password).not.toBe(registerData.password);
    });

    it('should check if the email is available', async () => {
      await expect(authService.register(user)).rejects.toThrow(
        'Email or username not available'
      );
    });
  });

  describe('login', () => {
    it('should create a new access for the user', async () => {
      const result = await authService.login({
        email: user.email,
        password: user.password,
      });

      expect(result.user).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });
      expect(result.accessToken).toBeDefined();

      const [accessTokenInDb] = await knex('user_tokens')
        .select('userId')
        .where('value', '=', result.accessToken)
        .andWhere('context', '=', 'access');

      expect(accessTokenInDb).toBeDefined();
      expect(accessTokenInDb.userId).toBe(result.user.id);
    });

    it('should check if the credentials is valid', async () => {
      await expect(
        authService.login({
          email: 'not@email.com',
          password: user.password,
        })
      ).rejects.toThrow('Invalid credentials');

      await expect(
        authService.login({
          email: user.email,
          password: 'wrongwrongwrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should delete the token from the database', async () => {
      const result = await authService.logout(tokens[0].value);
      expect(result).toBe(true);

      const [tokenInDb] = await knex('user_tokens')
        .select('*')
        .where('value', '=', tokens[0].value)
        .andWhere('context', '=', tokens[0].context);

      expect(tokenInDb).not.toBeDefined();
    });
  });

  describe('logoutFromAllDevices', () => {
    it('should delete all tokens for that user from the database', async () => {
      const result = await authService.logoutFromAllDevices(tokens[1].value);
      expect(result).toBe(true);

      const allUserTokens = await knex('user_tokens')
        .select('*')
        .where('userId', '=', user.id);

      expect(allUserTokens).toEqual([]);
    });
  });
});
