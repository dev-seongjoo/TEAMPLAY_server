import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../project/entities/project.entity";
import { User } from "../user/entities/user.entity";
import { Review } from "./entities/review.entity";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async findAll({projectId}) {
    return await this.reviewRepository.find({
      where: {project: projectId},
      relations: ['user','project']
    })
  }

  async findOne({reviewId}) {
    return await this.reviewRepository.findOne({
      where: { id: reviewId},
      relations: ['user', 'project']
    })
  }

  async create({projectId, createUser, title, content}) {
    const project = await this.projectRepository.findOne({id:projectId});
    const user = await this.userRepository.findOne({id: createUser});
    return await this.reviewRepository.save({project, user, title, content });
  }

  async update({reviewId, updateUser, title, content}) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId }, relations: ['user', 'project'] });
    if (updateUser !== review.user.id) throw new UnauthorizedException('자신의 후기만 수정 가능합니다.');
    const newReview = {
      ...review,
      title,
      content,
    };
    return await this.reviewRepository.save(newReview);
  }

  async delete({ reviewId, deleteUser }) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId }, relations: ['user', 'project'] });
    if (deleteUser !== review.user.id) throw new UnauthorizedException('자신의 후기만 삭제 가능합니다.');
    const result = await this.reviewRepository.softDelete({ id: reviewId }); 
    return result.affected ? true : false;
  }
}