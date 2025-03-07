import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';

@Module({
  imports: [DatabaseModule],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService]
})
export class CardModule {}
