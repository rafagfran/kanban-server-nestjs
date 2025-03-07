import { Module } from '@nestjs/common';
import { CardModule } from 'src/card/card.module';
import { ColumnModule } from 'src/column/column.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [CardModule, ColumnModule],
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule {}
