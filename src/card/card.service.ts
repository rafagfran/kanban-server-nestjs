import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TCardCreate } from 'src/types/types';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async createCard(cardInfos: TCardCreate) {
    await this.prisma.columns
      .findUnique({
        where: {
          id: cardInfos.columnId,
        },
      })
      .catch((err) => console.log(err));

    return this.prisma.cards.create({
      data: cardInfos,
    });
  }

  async getCardsByColumn(columnId: number) {
    const response = await this.prisma.cards.findMany({
      where: {
        columnId: {
          equals: columnId,
        },
      },
    });

    return response;
  }

  async getAllCards() {
    const response = await this.prisma.cards.findMany();
    return response;
  }
}
