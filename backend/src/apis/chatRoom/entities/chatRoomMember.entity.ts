import { Field, ObjectType } from '@nestjs/graphql';
import { ChatRoom } from 'src/apis/chatRoom/entities/chatRoom.entity';
import { User } from 'src/apis/user/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class ChatRoomMember {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @ManyToOne(() => ChatRoom, chatroom => chatroom.chatRoomMembers, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => ChatRoom)
  chatRoom!: ChatRoom;

  @ManyToOne(() => User)
  @Field(() => User)
  user!: User;
}
