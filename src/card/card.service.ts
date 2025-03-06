import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCardDto } from 'src/card/update-card.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCardDto } from './create-card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async createCard(cardInfos: CreateCardDto) {
    const { columnId, title } = cardInfos;

    const existingColumn = await this.prisma.columns.findUnique({
      where: { id: columnId }
    });

    if (!existingColumn) {
      throw new HttpException(
        'This column id does not exist',
        HttpStatus.NOT_FOUND
      );
    }

    const lastCard = await this.prisma.cards.aggregate({
      _max: { position: true }
    });

    if (!lastCard._max.position) {
      return this.prisma.cards.create({
        data: { columnId, title, position: 1 }
      });
    }

    return this.prisma.cards.create({
      data: { columnId, title, position: lastCard._max.position + 1 }
    });
  }

  async createCardsInBulk(cards: CreateCardDto[]) {
    if (!cards.length) {
      throw new HttpException('No cards to create', HttpStatus.BAD_REQUEST);
    }

    const lastCard = await this.prisma.cards.aggregate({
      _max: { position: true }
    });

    const cardsWithPosition = cards.map((card, index) => ({
      ...card,
      position: (lastCard._max.position ?? 0) + index + 1
    }));

    return this.prisma.cards.createMany({
      data: cardsWithPosition
    });
  }

  async createCardInBulkPerColumn({columnId, cards}: {columnId:number,cards: {title: string}[] }) {
    if (!cards.length) {
      throw new HttpException('No cards to create', HttpStatus.BAD_REQUEST);
    }


    const existingColumn = await this.prisma.columns.findUnique({
      where: {id: columnId}
    });

    if (!existingColumn) {
      throw new HttpException(
        'This column id does not exist',
        HttpStatus.NOT_FOUND
      );
    }

    const lastCard = await this.prisma.cards.aggregate({
      _max: { position: true }
    });

    const cardsWithPosition = cards.map((card, index) => ({
      columnId,
      title: card.title,
      position: (lastCard._max.position ?? 0) + index + 1
    }));

    return this.prisma.cards.createMany({
      data: cardsWithPosition
    });
  }

  async getCardsByColumn(columnId: number) {
    const response = await this.prisma.cards.findMany({
      where: {
        columnId: {
          equals: columnId
        }
      }
    });

    return response;
  }

  async getAllCards() {
    const response = await this.prisma.cards.findMany();
    return response;
  }

  async updateCardTitle(id: number, updatedData: UpdateCardDto) {
    const { title } = updatedData;

    const existingCard = await this.prisma.cards.findUnique({ where: { id } });

    if (!existingCard) {
      throw new HttpException('Card not found', HttpStatus.NOT_FOUND);
    }

    if (!title) {
      throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.cards.update({ where: { id }, data: { title } });
  }

  async deleteCard(id: number) {
    const existingCard = await this.prisma.cards.findUnique({ where: { id } });

    if (!existingCard) {
      throw new HttpException('Card not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.cards.delete({ where: { id } });

    return { message: `Card with ID [${id}] has been successfully deleted` };
  }
}
