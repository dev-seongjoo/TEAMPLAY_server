import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventGateway } from '../event/event.gateway';
import { User } from '../user/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { ChatRoom } from './entities/chatRoom.entity';
import { ChatRoomMember } from './entities/chatRoomMember.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatRoomMember)
    private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,

    private eventGateWay: EventGateway,
  ) {}

  async findChatRooms({ id }) {
    // const aaa = this.chatRepository
    //   .createQueryBuilder('chat')
    //   .subQuery()
    //   .select('chat.chatRoom as chatRoomId')
    //   .from(Chat, 'chat')
    //   .orderBy('chat.id', 'DESC')
    //   .getQuery();

    // console.log(aaa);

    const chatRoom = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.chatRoomMembers', 'chatRoomMembers', 'chatRoomMembers.user = :user', { user: id })
      .innerJoinAndSelect('chatRoom.project', 'project')
      .innerJoinAndSelect('project.leader', 'leader')
      .leftJoinAndSelect('chatRoom.chat', 'chat')
      .orderBy('chat.createdAt', 'DESC')
      //.leftJoinAndSelect(aaa, 'chat', 'chat.chatRoomId = chatRoom.id')
      // .where(qb => {
      //   const aaa = qb.subQuery().select('chatRoomId').from(Chat, 'chat').limit(1).getQuery();
      //   return 'chatRoom.id = ' + aaa;
      // })
      .getMany();

    // console.log(chatRoom);

    return chatRoom;
  }

  async findChats({ chatRoomId }) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.chatRoom = :chatRoomId', { chatRoomId })
      .innerJoinAndSelect('chat.user', 'user')
      .orderBy('chat.id', 'DESC')
      .getMany();
    return chat;
  }

  async findChatRoomMembers({ chatRoomId }) {
    return await this.chatRoomMemberRepository
      .createQueryBuilder('chatRoomMember')
      .where('chatRoomMember.chatRoom = :chatRoomId', { chatRoomId })
      .innerJoinAndSelect('chatRoomMember.user', 'user')
      .leftJoinAndSelect('user.tendencys', 'tendencys')
      .leftJoinAndSelect('user.position', 'position')
      .getMany();
  }

  async createChatRoomMembers({ userId, projectId }) {
    const chatRoom = await this.chatRoomRepository.findOne({ project: projectId });

    const chatRoomUser = await this.chatRoomMemberRepository.findOne({ user: userId, chatRoom });
    if (chatRoomUser) throw new BadRequestException('이미 참여중인 회원입니다');

    const user = await this.userRepository.findOne({ id: userId });

    this.eventGateWay.server.emit('join' + chatRoom.id, user);
    return await this.chatRoomMemberRepository.save({
      chatRoom,
      user,
    });
  }

  async createChat({ message, id, chatRoomId }) {
    const user = await this.userRepository.findOne({ id });

    const previousChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.user', 'user')
      .where({ chatRoom: chatRoomId })
      .orderBy('chat.id', 'DESC')
      .getOne();

    const chat = await this.chatRepository.save({
      content: message,
      user,
      chatRoom: chatRoomId,
    });

    const chatData = {
      previousChat,
      chat,
    };

    this.eventGateWay.server.emit('message' + chatRoomId, chatData);
    return '채팅저장성공';
  }
}
