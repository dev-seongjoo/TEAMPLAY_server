import { Field, ObjectType } from '@nestjs/graphql';
import { ProjectToPosition } from 'src/apis/project/entities/projectToPosition.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Position {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column({ unique: true })
  @Field(() => String)
  name!: string;

  @OneToMany(() => ProjectToPosition, projectToPositions => projectToPositions.position)
  @Field(() => [ProjectToPosition])
  projectToPositions!: ProjectToPosition[];
}
