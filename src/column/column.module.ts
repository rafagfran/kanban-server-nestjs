import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  providers: [ColumnService, PrismaService],
  controllers: [ColumnController]
})
export class ColumnModule {}  
