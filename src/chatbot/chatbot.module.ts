import { Module } from '@nestjs/common';
import { CardModule } from 'src/card/card.module';
import { ColumnModule } from 'src/column/column.module';
import { ChatbotController } from './chatbot.controller';

@Module({
  imports: [CardModule, ColumnModule],
  controllers: [ChatbotController],
  providers: []
})
export class ChatbotModule {}
