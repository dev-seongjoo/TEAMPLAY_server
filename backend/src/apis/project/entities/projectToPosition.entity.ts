import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Position } from 'src/apis/position/entities/position.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity()
@ObjectType()
export class ProjectToPosition {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @ManyToOne(() => Project, project => project.projectToPositions, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Project)
  project!: Project;

  @ManyToOne(() => Position, position => position.projectToPositions, { eager: true })
  @Field(() => Position)
  position!: Position;

  @Column()
  @Field(() => Int)
  number!: number;
}
