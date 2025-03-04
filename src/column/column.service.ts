import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TColumnsWithCards } from 'src/types/types';
import type { CreateColumnDto } from './create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async createColumn(newColumnData: CreateColumnDto) {
    const { title } = newColumnData;

    const lastColumn = await this.prisma.columns.aggregate({
      _max: { position: true }
    });

    if (!lastColumn._max.position) {
      return this.prisma.columns.create({ data: { title, position: 1 } });
    }

    return this.prisma.columns.create({
      data: { title, position: lastColumn._max.position + 1 }
    });
  }

  async listAllColumns() {
    return await this.prisma.columns.findMany();
  }

  async listColumnsWithCards(): Promise<TColumnsWithCards[]> {
    return await this.prisma.columns.findMany({
      include: { cards: { orderBy: { position: 'asc' } } }
    });
  }

  async updateColumnTitle(id: number, title: string) {
    const existentColumn = await this.prisma.columns.findUnique({
      where: { id }
    });

    if (!existentColumn) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.columns.update({
      where: { id },
      data: { title }
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
}
