import type { Cards, Prisma } from '@prisma/client';

export type TCardCreate = Pick<
  Prisma.CardsCreateManyInput,
  'columnId' | 'title' | 'position'
>;
export type TCard = Cards;

export type TListCreate = Prisma.ColumnsCreateInput;
export type TColumnsWithCards = Prisma.ColumnsGetPayload<{
  include: { cards: true };
}>;
