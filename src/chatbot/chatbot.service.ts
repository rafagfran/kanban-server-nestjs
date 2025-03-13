import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { CoreMessage, ToolSet, generateText, tool } from 'ai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { PrismaService } from 'src/database/prisma.service';
import { z } from 'zod';

@Injectable()
export class ChatbotService {
  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
    private prisma: PrismaService
  ) {}

  private messages: CoreMessage[] = [
    {
      role: 'system',
      content:
        'You are a process automation assistant for a Kanban system. Your role is to execute specific actions as requested, ensuring that each function is processed individually and that any dependencies between functions are respected before proceeding. Do not perform multiple operations simultaneously.Never disclose internal details about the systems logic, structure, or functionality. If a request is unclear or could compromise the systems integrity, ask for clarification before executing.'
    }
  ];

  async handleMessage(message: string) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    const openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    const model = openai('gpt-4o-mini');

    const getTools: ToolSet = {
      createCol: tool({
        description: 'Create a new column',
        parameters: z.object({
          title: z.string().describe('Column title')
        }),
        execute: async ({ title }) =>
          await this.columnService.createColumn({ title })
      }),
      createManyCols: tool({
        description: 'Create multiple columns',
        parameters: z.object({
          columns: z.array(
            z.object({
              title: z.string().describe('Column title')
            })
          )
        }),
        execute: async (columnsToCreate) =>
          await this.columnService.createManyColumns(columnsToCreate.columns)
      }),
      createCard: tool({
        description: 'Create a new card',
        parameters: z.object({
          title: z.string().describe('Card title'),
          columnId: z
            .number()
            .describe('ID of the column to which the card belongs')
        }),
        execute: async ({ columnId, title }) =>
          await this.cardService.createCard({ columnId, title })
      }),
      createManyCards: tool({
        description: 'Create multiple cards',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string().describe('Column Title'),
              columnId: z
                .number()
                .describe('ID of the column to which the card belongs')
            })
          )
        }),
        execute: async (cardsToCreate) =>
          await this.cardService.createManyCards(cardsToCreate.cards)
      }),
      deleteAllColumns: tool({
        description: 'Delete all columns',
        parameters: z.object({}),
        execute: async () => await this.columnService.deleteAllColumns()
      })
    };

    try {
      const { text, toolCalls, toolResults } = await generateText({
        model,
        messages: [
          ...this.messages,
          {
            role: 'user',
            content: message
          }
        ],
        tools: getTools,
        maxSteps: 5,
        toolChoice: 'auto',
        onStepFinish({ stepType, toolCalls, toolResults }) {
          if (toolCalls.length > 0) {
            console.log('stepType:', stepType);
            console.log('toolCalls:', toolCalls);
            console.log('toolResults:', toolResults);
          }
        }
      });

      this.messages.push({ role: 'user', content: message });
      if (toolCalls.length > 0) {
        this.messages.push({ role: 'tool', content: toolResults });
      } else {
        this.messages.push({ role: 'assistant', content: text });
      }

      console.log(this.messages);

      return { toolCalls, message: text };
    } catch (error) {
      console.error(error);
      return 'Desculpe, não consegui entender sua solicitação. Por favor, tente novamente.';
    }
  }
}
