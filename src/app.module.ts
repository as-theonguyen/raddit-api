import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@src/config/configuration';
import knexConfig from '@src/config/knexfile';
import { KnexModule } from '@src/knex/knex.module';
import { UserModule } from '@src/user/user.module';
import { AuthModule } from '@src/auth/auth.module';
import { UtilModule } from './util/util.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('env');
        const knexOptions = knexConfig[env];
        return knexOptions;
      },
    }),
    UserModule,
    AuthModule,
    UtilModule,
    PostModule,
    CommentModule,
    FollowModule,
  ],
})
export class AppModule {}
