import { Module } from '@nestjs/common';
import { CardModule } from 'src/card/card.module';
import { ColumnModule } from 'src/column/column.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [CardModule, ColumnModule, DatabaseModule],
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule {}
