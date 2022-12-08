import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/user/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity()
@ObjectType()
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @ManyToOne(() => User, user => user.projectMembers, { eager: true })
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Project, project => project.projectMembers, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Project)
  project!: Project;
}
