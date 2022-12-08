import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from '../chatRoom/entities/chatRoom.entity';
import { ChatRoomMember } from '../chatRoom/entities/chatRoomMember.entity';
import { Location } from '../location/entities/location.entity';
import { Platform } from '../platform/entities/platform.entity';
import { Position } from '../position/entities/position.entity';
import { Type } from '../type/entities/type.entity';
import { User } from '../user/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/projectMember.entity';
import { ProjectToPosition } from './entities/projectToPosition.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,

    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,

    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,

    @InjectRepository(ProjectToPosition)
    private readonly projectToPositionRepository: Repository<ProjectToPosition>,

    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(ChatRoomMember)
    private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

  ) {}

  async findOne({ projectId }) {
    return await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['type', 'location', 'leader', 'projectToPositions', 'platforms', 'projectMembers', 'boards', 'tasks', 'qnas', 'reviews'],
    });
  }

  async find({ page }) {
    return await this.projectRepository.find({
      relations: ['type'],
      take: 12,
      skip: 12 * (page - 1),
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(){
    return await this.projectRepository.find({})
  }

  async findCount() {
    return await this.projectRepository.count({ isStart: false });
  }

  async findMyProjects({ currentUser }) {
    return await this.projectRepository
      .createQueryBuilder('project')
      .innerJoin('project.projectMembers', 'projectMembers', 'projectMembers.user = :userId', {
        userId: currentUser.id,
      })
      .getMany();
  }

  async create({ leaderId, createProjectInput }) {
    const { typeId, locationId, positionIds, numbers, platformIds, ...rest } = createProjectInput;

    const leader = await this.userRepository.findOne({ id: leaderId });
    const type = await this.typeRepository.findOne({ id: typeId });
    const location = await this.locationRepository.findOne({ id: locationId });
    const positions = await Promise.all(positionIds.map(id => this.positionRepository.findOne({ id })));
    const platforms = await Promise.all(platformIds.map(id => this.platformRepository.findOne({ id })));

    const project = await this.projectRepository.save({
      leader,
      type,
      location,
      platforms,
      ...rest,
    });

    await Promise.all(
      positions.map((position, i) => {
        return this.projectToPositionRepository.save({
          project,
          position,
          number: numbers[i],
        });
      }),
    );

    const chatRoom = await this.chatRoomRepository.save({
      name: project.name,
      project,
    });

    await this.chatRoomMemberRepository.save({
      chatRoom,
      user: leader,
    });

    return project;
  }

  async createProjectMember({ chatRoomId, userIds, leaderId, point }) {
    const chatRoom = await this.chatRoomRepository.findOne({ where: { id: chatRoomId }, relations: ['project'] });
    const project = await this.projectRepository.findOne({ where: { id: chatRoom.project.id }, relations: ['leader'] });
    if (project.isStart) throw new ConflictException('이미 시작된 프로젝트입니다.');
    if (leaderId !== project.leader.id) throw new BadRequestException('프로젝트 리더만 프로젝트시작이 가능합니다.');

    userIds.push(leaderId);

    const users = await Promise.all(
      userIds.map(userId => {
        return this.userRepository.findOne({ id: userId });
      }),
    );

    const failUsers = [];
    users.forEach(user => {
      if (user.point < point) {
        failUsers.push(user);
      }
    });

    if (failUsers.length !== 0) {
      let string = '';
      failUsers.forEach(failUser => {
        string += `${failUser.name}(${failUser.point}) `;
      });
      throw new ConflictException(`가진 포인트가 부족한 회원이 있습니다. ${string}`);
    }

    await Promise.all(
      users.map(user => {
        return this.userRepository.update({ id: user.id }, { point: user.point - point });
      }),
    );

    await Promise.all(
      users.map(user => {
        return this.projectMemberRepository.save({
          project,
          user,
        });
      }),
    );

    await this.projectRepository.save({
      ...project,
      isStart: true,
      point,
    });

    await this.chatRoomRepository.softDelete({ id: chatRoomId });

    return await this.projectRepository.findOne({ where: { id: project.id }, relations: ['projectMembers'] });
  }

  async endProject({ leaderId, projectId }) {
    const user = await this.userRepository.findOne({ id: leaderId });
    const project = await this.projectRepository.findOne({ where: { id: projectId }, relations: ['leader'] });
    if (!project) throw new BadRequestException('존재하지않는 프로젝트입니다.');
    if (project.isComplete) throw new BadRequestException('이미 완료된 프로젝트입니다.');
    if (!project.isStart) throw new BadRequestException('시작된 프로젝트가 아닙니다.');
    if (user.id !== project.leader.id) throw new UnauthorizedException('프로젝트 리더만 프로젝트 완료가 가능합니다.');

    const projectMembers = await this.projectMemberRepository.find({ where: { project }, relations: ['user'] });
    await Promise.all(
      projectMembers.map(member => {
        this.userRepository.update({ id: member.user.id }, { point: member.user.point + project.point });
      }),
    );
    await this.projectRepository.update({ id: projectId }, { isComplete: true });

    return true;
  }

  async deleteAll() {
    await this.chatRoomRepository.delete({});
    const result = await this.projectRepository.delete({});
    return result.affected ? true : false;
  }

  async delete({ projectId }) {
    const result = await this.projectRepository.softDelete({ id: projectId });
    return result.affected ? true : false;
  }
}
