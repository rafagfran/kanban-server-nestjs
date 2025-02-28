import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TCard, TCardCreate } from 'src/types/types';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  //PIPES DTOS PARA VALIDAÇÃO
  @Post()
  async createCard(@Body() newCardInfos: TCardCreate) {
    return this.cardService.createCard(newCardInfos);
  }

  @Get(':id')
  async listCardsByColumn(@Param('id') id: string): Promise<TCard[]> {
    return this.cardService.getCardsByColumn(+id);
  }

  @Get()
  async listAllCards(): Promise<TCard[]> {
    return this.cardService.getAllCards();
  }
}
