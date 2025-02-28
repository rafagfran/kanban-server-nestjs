import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from './card/card.module';
import { DatabaseModule } from './database/database.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [CardModule, DatabaseModule, ListModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
