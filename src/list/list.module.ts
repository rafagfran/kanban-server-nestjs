import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ListController } from './list.controller';
import { ListService } from './list.service';

@Module({
  controllers: [ListController],
  providers: [ListService, PrismaService]
})
export class ListModule {}
