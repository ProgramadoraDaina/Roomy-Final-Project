import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [RoomsModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
