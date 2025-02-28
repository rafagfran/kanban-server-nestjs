import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CardController } from './card.controller';
import { CardService } from './card.service';

@Module({
  providers: [CardService, PrismaService],
  controllers: [CardController]
})
export class CardModule {}
