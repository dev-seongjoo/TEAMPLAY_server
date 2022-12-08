import { Module } from '@nestjs/common';
import { Project } from "../project/entities/project.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from "../user/entities/user.entity";
import { Qna } from "./entities/qna.entity";
import { QnaResolver } from './qna.resolver';
import { QnaService } from './qna.service';

@Module({
  imports: [TypeOrmModule.forFeature([Qna, User, Project])],
  providers: [QnaResolver, QnaService]
})
export class QnaModule {}