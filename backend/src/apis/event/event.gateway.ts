import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000', 'https://codecamptest.shop'],
    credentials: true,
  },
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() public server: Server;

  @SubscribeMessage('front')
  handleEvent(@MessageBody() data, @ConnectedSocket() client: Socket) {
    client.emit('back', data, client.id);
    data.channels.forEach(channel => {
      console.log('join', channel);
      client.join(channel);
    });
  }

  afterInit(server: Server) {
    console.log('=====init=======');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('======connected====', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('======disconnected====', client.id);
  }
}
