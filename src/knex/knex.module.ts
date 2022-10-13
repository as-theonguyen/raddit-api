import initKnex, { Knex } from 'knex';
import {
  DynamicModule,
  FactoryProvider,
  Global,
  Module,
  ModuleMetadata,
} from '@nestjs/common';

export const KNEX_CONNECTION = 'KNEX_CONNECTION';

type KnexModuleAsyncOptions = {
  useFactory: (...args: any[]) => Knex.Config | Promise<Knex.Config>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Global()
@Module({})
export class KnexModule {
  static forRoot(options: Knex.Config): DynamicModule {
    const knex = initKnex(options);

    const knexProvider = {
      provide: KNEX_CONNECTION,
      useValue: knex,
    };

    return {
      module: KnexModule,
      providers: [knexProvider],
      exports: [knexProvider],
    };
  }

  static forRootAsync(options: KnexModuleAsyncOptions): DynamicModule {
    const knexProvider = {
      provide: KNEX_CONNECTION,
      useFactory: async (...args: any[]) => {
        const knexConfig = await options.useFactory(...args);
        const knex = initKnex(knexConfig);
        return knex;
      },
      inject: options.inject,
    };

    return {
      module: KnexModule,
      imports: options.imports,
      providers: [knexProvider],
      exports: [knexProvider],
    };
  }
}
