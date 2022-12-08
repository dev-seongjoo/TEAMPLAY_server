import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from '../position/entities/position.entity';
import { Tendency } from '../tendency/entities/tendency.entity';
import { Type } from '../type/entities/type.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    User, 
    Type, 
    Tendency, 
    Position
  ]),
  ElasticsearchModule.register({
    node: 'http://elasticsearch:9200',
  }),
],
  
  providers: [UserResolver, UserService],
})
export class UserModule {}
