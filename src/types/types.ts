import { Cards, Columns, Prisma } from '@prisma/client';

// Cards
export type CardResponse = Cards;
export type CardCreateInput = Prisma.CardsCreateManyInput;

// Columns
export type ColumnResponse = Columns;
export type ColumnWithCardsResponse = Prisma.ColumnsGetPayload<{
  include: { cards: true };
}>;
export type ColumnCreateInput = Prisma.ColumnsCreateManyInput;
;
