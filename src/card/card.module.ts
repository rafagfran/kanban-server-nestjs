import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
