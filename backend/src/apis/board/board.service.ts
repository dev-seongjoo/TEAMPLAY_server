import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll({ projectId }) {
    return await this.boardRepository.find({
      where: { project: projectId },
      relations: ['user','project']
    });
  }

  async findOne({ boardId }) {
    return await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user','project']
    });
  }

  async create({ projectId, createUser, title, content }) {
    const user = await this.userRepository.findOne({ id: createUser });
    const project = await this.projectRepository.findOne({ id: projectId });
    return await this.boardRepository.save({ user, title, content, project });
  }

  async update({ boardId, updateUser, title, content }) {
    const board = await this.boardRepository.findOne({ where: { id: boardId }, relations: ['user'] });
    if (updateUser !== board.user.id) throw new UnauthorizedException('자신의 게시글만 수정 가능합니다.');
    const newBoard = {
      ...board,
      title,
      content,
    };
    return await this.boardRepository.save(newBoard);
  }

  async delete({ boardId, deleteUser }) {
    const board = await this.boardRepository.findOne({ where: { id: boardId }, relations: ['user', 'project'] });
    if (deleteUser !== board.user.id) throw new UnauthorizedException('자신의 게시글만 삭제 가능합니다.');
    const result = await this.boardRepository.softDelete({ id: boardId });
    return result.affected ? true : false;
  }
}
