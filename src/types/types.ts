import { Cards, Columns, Prisma } from '@prisma/client';

// Cards
export type CardResponse = Cards;
export type CardCreateInput = Pick<Prisma.CardsCreateManyInput, 'columnId' | 'title' | 'position'>;

// Columns
export type ColumnResponse = Columns;
export type ColumnWithCardsResponse = Prisma.ColumnsGetPayload<{
  include: { cards: true };
}>;
export type ColumnCreateInput = Pick<Prisma.ColumnsCreateManyInput, 'title' | 'position'>;
