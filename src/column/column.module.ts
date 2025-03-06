import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  imports: [DatabaseModule],
  providers: [ColumnService],
  controllers: [ColumnController],
  exports: [ColumnService]
})
export class ColumnModule {}
