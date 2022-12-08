import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { Qna } from './entities/qna.entity';

@Injectable()
export class QnaService {
  constructor(
    @InjectRepository(Qna)
    private readonly qnaRepository: Repository<Qna>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll({ projectId }) {
    return await this.qnaRepository.find({
      where: { project: projectId },
      relations: ['user','project']
    });
  }

  async findOne({ qnaId }) {
    return await this.qnaRepository.findOne({
      where: { id: qnaId },
      relations: ['user','project']
    });
  }

  async create({ projectId, createUser, qnaType, title, content }) {
    const project = await this.projectRepository.findOne({ id: projectId });
    const user = await this.userRepository.findOne({ id: createUser });
    return await this.qnaRepository.save({ project, user, qnaType, title, content });
  }

  async update({ qnaId, updateUser, title, content }) {
    const qna = await this.qnaRepository.findOne({ where: { id: qnaId }, relations: ['user', 'project'] });
    if (updateUser !== qna.user.id) throw new UnauthorizedException('자신의 질문만 수정 가능합니다.');
    const newQna = {
      ...qna,
      title,
      content,
    };
    return await this.qnaRepository.save(newQna);
  }

  async delete({ qnaId, deleteUser }) {
    const qna = await this.qnaRepository.findOne({ where: { id: qnaId }, relations: ['user', 'project'] });
    if (deleteUser !== qna.user.id) throw new UnauthorizedException('자신의 질문만 삭제 가능합니다.');
    const result = await this.qnaRepository.softDelete({ id: qnaId }); 
    return result.affected ? true : false;
  }
}
