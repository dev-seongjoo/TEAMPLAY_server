import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Project } from 'src/apis/project/entities/project.entity';
import { User } from 'src/apis/user/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';

export enum TASK_TYPE_ENUM {
  DESIGN = 'DESIGN',
  DEVELOPMENT = 'DEVELOPMENT',
  PLANNING = 'PLANNING',
}

registerEnumType(TASK_TYPE_ENUM, {
  name: 'TASK_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  content: string;

  @Column()
  @Field(() => Date)
  limit: Date;

  @Column({ type: 'enum', enum: TASK_TYPE_ENUM })
  @Field(() => TASK_TYPE_ENUM)
  taskType: TASK_TYPE_ENUM;

  @Column({ default: 0 })
  @Field(() => Boolean)
  is_complete: boolean; 

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;

  @ManyToOne(() => Project)
  @Field(() => Project)
  project: Project;
  
  @ManyToOne(() => User, user => user.id)
  @Field(() => User)
  user: User

  @JoinTable()
  @ManyToMany(() => User, user => user.id)
  @Field(() => [User])
  users?: User[]
}
