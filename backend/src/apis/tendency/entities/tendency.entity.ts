import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Tendency {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column({ unique: true })
  @Field(() => String)
  name!: string;

  @ManyToMany(() => User, user => user.tendencys, {
    cascade: true,
    onDelete: 'CASCADE',
  })

  @Field(() => [User])
  users?: User[];
}
