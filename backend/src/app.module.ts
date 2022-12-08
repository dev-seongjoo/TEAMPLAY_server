import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type { RedisClientOptions } from 'redis';
import redisStore from 'cache-manager-redis-store';
import { AuthModule } from './apis/auth/auth.module';
import { PositionModule } from './apis/position/position.module';
import { ProjectModule } from './apis/project/project.module';
import { LocationModule } from './apis/location/location.module';
import { PlatformModule } from './apis/platform/platform.module';
import { FileModule } from './apis/file/file.module';
import { PointPaymentModule } from './apis/pointPayment/pointPayment.module';
import { ChatRoomModule } from './apis/chatRoom/chatRoom.module';
import { EventModule } from './apis/event/event.module';
import { BoardModule } from './apis/board/board.module';
import { RegionModule } from './apis/region/region.module';
import { TaskModule } from './apis/task/task.module';
import { TendencyModule } from './apis/tendency/tendency.module';
import { TypeModule } from './apis/type/type.module';
import { UserModule } from './apis/user/user.module';
import { QnaModule } from './apis/qna/qna.module';
import { ReviewModule } from './apis/review/review.module';


@Module({
  imports: [
    AuthModule,
    ChatRoomModule,
    EventModule,
    FileModule,
    LocationModule,
    PlatformModule,
    PointPaymentModule,
    PositionModule,
    ProjectModule,
    RegionModule,
    TaskModule,
    TendencyModule,
    TypeModule,
    UserModule,
    BoardModule,
    QnaModule,
    ReviewModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/common/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
        credentials: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'teamplay_database',
      port: 3306,
      username: 'root',
      password: process.env.MYSQL_PASSWORD,
      database: 'TEAMPLAY',
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
      timezone: 'Asia/Seoul',
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://teamplay_redis:6379',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
