import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from './card/card.module';
import { DatabaseModule } from './database/database.module';

import { ColumnModule } from './column/column.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [CardModule, DatabaseModule, ColumnModule, ChatbotModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
