import { Field, ObjectType } from '@nestjs/graphql';
import { Project } from 'src/apis/project/entities/project.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Platform {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  name!: string;

  @ManyToMany(() => Project, project => project.platforms)
  @Field(() => [Project])
  projects!: Project[];
}
