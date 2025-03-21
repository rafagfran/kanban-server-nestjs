import { Cards, Columns, Prisma } from '@prisma/client';

// Cards
export type CardResponse = Cards;
export type CardCreateInput = Pick<
  Prisma.CardsCreateManyInput,
  'columnId' | 'title' | 'position' | 'priority'
>;

export enum CardPriority {
	Low = 'low',
	Medium = 'medium',
	Hight = 'high',
}


// Columns
export type ColumnResponse = Columns;
export type ColumnWithCardsResponse = Prisma.ColumnsGetPayload<{
  include: { cards: true };
}>;
export type ColumnCreateInput = Pick<
  Prisma.ColumnsCreateManyInput,
  'title' | 'position'
>;
export type columnUpdate = Pick<
  Prisma.ColumnsUpdateManyMutationInput,
  'position' | 'title'
>;
