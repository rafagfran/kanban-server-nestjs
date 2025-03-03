import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateListDto } from './create-list.dto';
import { UpdateListDto } from './update-list.dto';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async createList(newListData: CreateListDto) {
    const { title } = newListData;

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

  async getAllLists() {
    return await this.prisma.columns.findMany();
  }

  async updateListTitle(id: number, updatedData: UpdateListDto) {
    const { title } = updatedData;

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

  async deleteList(id: number) {
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
