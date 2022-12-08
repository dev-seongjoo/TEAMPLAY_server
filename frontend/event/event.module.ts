import { Module } from '@nestjs/common';
import { ChatGateway } from './event.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
