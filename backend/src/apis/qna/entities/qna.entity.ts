import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";
import { Project } from "src/apis/project/entities/project.entity";
import { User } from "src/apis/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum QNA_TYPE_ENUM {
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER'
}

registerEnumType(QNA_TYPE_ENUM, {
  name: 'QNA_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class Qna {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'enum', enum: QNA_TYPE_ENUM })
  @Field(() => QNA_TYPE_ENUM)
  qnaType: QNA_TYPE_ENUM;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  content: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Project, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Project)
  project: Project;
}
