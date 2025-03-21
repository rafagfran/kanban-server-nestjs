import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  ColumnResponse,
  ColumnWithCardsResponse,
  columnUpdate
} from 'src/types/types';
import type { CreateColumnDto } from './create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async createColumn(newColumnData: CreateColumnDto): Promise<ColumnResponse> {
    const { title } = newColumnData;

    const lastColumn = await this.prisma.columns.aggregate({
      _max: { position: true }
    });

    if (!lastColumn._max.position) {
      return await this.prisma.columns.create({ data: { title, position: 1 } });
    }

    return await this.prisma.columns.create({
      data: { title, position: lastColumn._max.position + 1 }
    });
  }

  async createManyColumns(
    newColumnsData: CreateColumnDto[]
  ): Promise<ColumnResponse[]> {
    return await this.prisma.$transaction(async (fx) => {
      const lastColumn = await fx.columns.aggregate({
        _max: { position: true }
      });

      const colsWithPosition = newColumnsData.map((columns, index) => {
        return {
          ...columns,
          position: (lastColumn._max.position ?? 0) + index + 1
        };
      });

      await fx.columns.createMany({data: colsWithPosition})
      
      return await fx.columns.findMany({
        where:{
          position: {in: colsWithPosition.map(col => col.position)}
        }
      });
    });
  }

  async listAllColumns() {
    return await this.prisma.columns.findMany();
  }

  async listColumnsWithCards(): Promise<ColumnWithCardsResponse[]> {
    return await this.prisma.columns.findMany({
      include: { cards: { orderBy: { position: 'asc' } } }
    });
  }

  async updateColumn(id: number, newInfos: columnUpdate) {
    const existentColumn = await this.prisma.columns.findUnique({
      where: { id }
    });

    if (!existentColumn) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.columns.update({
      where: { id },
      data: newInfos
    });
  }

  async deleteColumn(id: number) {
    const existentColumn = await this.prisma.columns.findUnique({
      where: { id }
    });

    if (!existentColumn) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    const containCards = await this.prisma.cards.findMany({
      where: { columnId: id }
    });

    if (containCards.length > 0) {
      await this.prisma.cards.deleteMany({ where: { columnId: id } });
    }

    return await this.prisma.columns.delete({ where: { id } });
  }

  async deleteAllColumns() {
    const existentColumns = await this.prisma.columns.findMany();

    if (existentColumns.length === 0) {
      return 'There are no columns to delete';
    }

    const columnsId = existentColumns.map((column) => column.id);

    await this.prisma.cards.deleteMany({
      where: { columnId: { in: columnsId } }
    });

    return await this.prisma.columns.deleteMany({
      where: { id: { in: columnsId } }
    });
  }
}
