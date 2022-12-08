import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomPayloadDto } from './dto/room.dto';
import { SendMsgDto } from './dto/msg.dto';

@WebSocketGateway(8080, {
  //   namespace: 'chat/room',
  cors: {
    origin: 'http://127.0.0.1:5501',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private static readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    ChatGateway.logger.debug(`Socket Server Init Complete`);
  }

  handleConnection(client: Socket): void {
    ChatGateway.logger.debug(
      `${client.id}(${client.handshake.query['username']}) is connected!`,
    );
    console.log('33322', client.rooms);
  }

  handleDisconnect(client: Socket) {
    ChatGateway.logger.debug(`${client.id} is disconnected...`);
  }

  //socket.on과 비슷한 기능을 갖으며 특정 event를 listen한다.
  @SubscribeMessage('enter_room')
  async enterRoom(
    @ConnectedSocket() client: Socket,

    @MessageBody() roomPayloadDto: RoomPayloadDto,
  ): Promise<void> {
    // const { roomId, userId } = roomDto;

    const { roomName, nickName, userId } = roomPayloadDto;
    // console.log('this is userId', userId);
    // const roomId = userId + client.id;
    // console.log('this is roomName', roomId);
    // await client.join(roomId);
    // client.emit('aaa', roomId);
    console.log('123123', this.server.sockets.adapter.sids);

    //socket.emit('aaa',roomName)
  }

  @SubscribeMessage('new_message')
  async handlNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    //디비에 저장

    client.to(client.id).emit('new_message', data);
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomDto: RoomPayloadDto,
  ): Promise<void> {
    const { roomName } = roomDto;
    console.log('떠낫습니다.');
    await client.leave(roomName);
  }

  @SubscribeMessage('msg/server')
  async handleMessage(@MessageBody() sendMsgDto: SendMsgDto): Promise<void> {
    const { roomId, msg, userId } = sendMsgDto;
    this.server.to(roomId).emit('msg/client', sendMsgDto);
  }
}
