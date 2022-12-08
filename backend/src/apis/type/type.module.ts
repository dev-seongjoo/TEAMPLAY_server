import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';
import { TypeResolver } from './type.resolver';
import { TypeService } from './type.service';

@Module({
  imports: [TypeOrmModule.forFeature([Type])],
  providers: [TypeResolver, TypeService],
})
export class TypeModule {}
