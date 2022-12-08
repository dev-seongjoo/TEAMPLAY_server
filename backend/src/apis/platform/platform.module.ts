import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { PlatformResolver } from './platform.resolver';
import { PlatformService } from './platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([Platform])],
  providers: [PlatformResolver, PlatformService],
})
export class PlatformModule {}
