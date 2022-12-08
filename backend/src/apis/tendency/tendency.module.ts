import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tendency } from './entities/tendency.entity';
import { TendencyResolver } from './tendency.resolver';
import { TendencyService } from './tendency.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tendency])],
  providers: [TendencyResolver, TendencyService],
})
export class TendencyModule {}
