import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { Project } from "../project/entities/project.entity";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Review, Project, User ])],
  providers: [ReviewResolver, ReviewService]
})
export class ReviewModule {}
