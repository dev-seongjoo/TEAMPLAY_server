import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from '../event/event.module';
import { User } from '../user/entities/user.entity';
import { ChatRoomResolver } from './chatRoom.resolver';
import { ChatRoomService } from './chatRoom.service';
import { Chat } from './entities/chat.entity';
import { ChatRoom } from './entities/chatRoom.entity';
import { ChatRoomMember } from './entities/chatRoomMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, Chat, User, ChatRoomMember]), EventModule],
  providers: [ChatRoomResolver, ChatRoomService],
})
export class ChatRoomModule {}
