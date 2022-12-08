import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IntValueNode } from 'graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { ChatRoomService } from './chatRoom.service';
import { Chat } from './entities/chat.entity';
import { ChatRoom } from './entities/chatRoom.entity';
import { ChatRoomMember } from './entities/chatRoomMember.entity';

@Resolver()
export class ChatRoomResolver {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatRoom])
  async fetchChatRooms(@CurrentUser() currentUser: ICurrentUser) {
    return await this.chatRoomService.findChatRooms({ id: currentUser.id });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Chat])
  async fetchChats(@CurrentUser() currentUser: ICurrentUser, @Args('chatRoomId') chatRoomId: string) {
    return await this.chatRoomService.findChats({ chatRoomId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatRoomMember])
  async fetchChatRoomMembers(@Args('chatRoomId') chatRoomId: string) {
    return await this.chatRoomService.findChatRoomMembers({ chatRoomId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ChatRoomMember)
  async joinChatRoom(@CurrentUser() currentUser: ICurrentUser, @Args('projectId') projectId: string) {
    return await this.chatRoomService.createChatRoomMembers({ userId: currentUser.id, projectId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async sendMessage(
    @Args('message') message: string,
    @CurrentUser() currentUser: ICurrentUser,
    @Args('chatRoomId') chatRoomId: string,
  ) {
    return await this.chatRoomService.createChat({ message, id: currentUser.id, chatRoomId });
  }
}
