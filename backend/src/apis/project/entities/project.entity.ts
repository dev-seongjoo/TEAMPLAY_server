import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Board } from 'src/apis/board/entities/board.entity';
import { ChatRoom } from 'src/apis/chatRoom/entities/chatRoom.entity';
import { Location } from 'src/apis/location/entities/location.entity';
import { Platform } from 'src/apis/platform/entities/platform.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectToPosition } from './projectToPosition.entity';
import { ProjectMember } from './projectMember.entity';
import { Task } from 'src/apis/task/entities/task.entity';
import { User } from 'src/apis/user/entities/user.entity';
import { Type } from 'src/apis/type/entities/type.entity';
import { Qna } from 'src/apis/qna/entities/qna.entity';
import { Review } from 'src/apis/review/entities/review.entity';


export enum METHOD_ENUM {
  MEET = 'MEET',
  UNTACT = 'UNTACT',
  MEDIATE = 'MEDIATE',
}
registerEnumType(METHOD_ENUM, {
  name: 'METHOD_ENUM',
});

@Entity()
@ObjectType()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  name!: string;

  @Column()
  @Field(() => String)
  teamname!: string;

  @Column()
  @Field(() => String)
  intro!: string;

  @Column({ type: 'enum', enum: METHOD_ENUM })
  @Field(() => METHOD_ENUM)
  method!: METHOD_ENUM;

  @Column()
  @Field(() => Date)
  recruitDate!: Date;

  @Column()
  @Field(() => String)
  imgUrl!: string;

  @Column()
  @Field(() => String)
  skill!: string;

  @Column({ type: 'text' })
  @Field(() => String)
  description!: string;

  @Column({ default: false })
  @Field(() => Boolean)
  isComplete!: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  isStart!: boolean;

  @Column({ default: 0 })
  @Field(() => Int)
  point?: number;

  @ManyToOne(() => Type, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Type)
  type!: Type;

  @ManyToOne(() => Location, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Location)
  location!: Location;

  @ManyToOne(() => User)
  @Field(() => User)
  leader!: User;

  @OneToMany(() => ProjectToPosition, projectToPosition => projectToPosition.project, { eager: true })
  @Field(() => [ProjectToPosition])
  projectToPositions!: ProjectToPosition[];

  @JoinTable()
  @ManyToMany(() => Platform, platform => platform.projects)
  @Field(() => [Platform])
  platforms!: Platform[];

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt!: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt!: Date;

  @OneToMany(() => Board, board => board.project)
  @Field(() => [Board], { nullable: true })
  boards?: Board[];

  @OneToMany(() => Task, task => task.project)
  @Field(() => [Task], { nullable: true })
  tasks?: Task[];

  @OneToMany(() => Qna, qna => qna.project)
  @Field(() => [Qna], { nullable: true })
  qnas?: Qna[];

  @OneToMany(() => Review, review => review.project)
  @Field(() => [Review], { nullable: true })
  reviews?: Review[];

  @OneToMany(() => ProjectMember, projectMember => projectMember.project)
  @Field(() => [ProjectMember], { nullable: true })
  projectMembers?: ProjectMember[];

  @OneToOne(() => ChatRoom, chatRoom => chatRoom.project)
  chatRoom!: ChatRoom;
}
