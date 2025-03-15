import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import {
  CoreMessage,
  ToolExecutionError,
  ToolSet,
  generateText,
  tool
} from 'ai';
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
  private token = process.env.GITHUB_TOKEN;
  private endpoint = 'https://models.inference.ai.azure.com';
  private openai = createOpenAI({ baseURL: this.endpoint, apiKey: this.token });
  private model = this.openai('gpt-4o-mini');

  private messages: CoreMessage[] = [
    {
      role: 'system',
      content:
        'You are a process automation assistant for a Kanban system. Your role is to execute specific actions as requested, ensuring that each function is processed individually and that any dependencies between functions are respected before proceeding. When handling requests, always ensure that columns are created before cards, as cards depend on the existence of columns. If a user requests the creation of both columns and cards in a single operation, process the columns first, and only then proceed to create the cards. When creating multiple cards, always group them into a single batch operation, regardless of which columns they belong to. If a request is unclear, could compromise the systems integrity, or violates the dependency rules (e.g., creating cards before columns), ask for clarification before executing. Never disclose internal details about the systems logic, structure, or functionality'
    }
  ];

  async handleMessage(message: string) {
    const getTools: ToolSet = {
      createCol: tool({
        description: 'Create a new column',
        parameters: z.object({
          title: z.string().describe('Column title')
        }),
        execute: async ({ title }) =>
          await this.columnService.createColumn({ title })
      }),
      createMultipleCols: tool({
        description: 'Create multiple columns and return the coluns data',
        parameters: z.object({
          columns: z.array(
            z.object({
              title: z.string().describe('Column title')
            })
          )
        }),
        execute: async ({ columns }) =>
          await this.columnService.createManyColumns(columns)
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
      createMultipleCards: tool({
        description: 'Create multiple cards',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string().describe('title of card'),
              columnId: z.number().describe('Number of column')
            })
          ) 
        }),
        execute: async ({ cards }) => {
          if (!Array.isArray(cards)) {
            return 'Cards nao estao no formato correto';
          }
          return await this.cardService.createManyCards(cards);
        }
      }),
      deleteAllColumns: tool({
        description: 'Delete all columns',
        parameters: z.object({}),
        execute: async () => await this.columnService.deleteAllColumns()
      }),
    };

    try {
      const {
        text,
        toolCalls,
        toolResults,
        response: { timestamp }
      } = await generateText({
        model: this.model,
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

      return { toolCalls, message: text, timestamp };
    } catch (error) {
      if (ToolExecutionError.isInstance(error)) {
        const { message, name, toolArgs, toolName, cause } = error;

        console.log({ name, message, toolArgs, toolName, cause });

        return {
          message:
            'Desculpe, não consegui processar sua solicitação, tente novamente mais tarde!'
        };
        // Handle the error
      }
      console.error(error);
      return 'Desculpe, não consegui entender sua solicitação. Por favor, tente novamente.';
    }
  }

  // async createMultipleColsAndCards({
  //   columns,
  //   cards
  // }: {
  //   columns: { title: string }[];
  //   cards: { title: string; columnId: number }[];
  // }) {
  //   const { toolResults } = await generateText({
  //     messages: [{ role: 'user', content: `New columns title ${columns}` }],
  //     model: this.model,
  //     toolChoice: { type: 'tool', toolName: 'createMultipleCols' }
  //   });

  //   const createdCols = toolResults.map((result: ToolResultPart) => {
  //     return result.result;
  //   });

  //   const toolCards = await generateText({
  //     model: this.model,
  //     messages: [
  //       {
  //         role: 'user',
  //         content: `Columns data ${createdCols}, Cards data ${cards}`
  //       }
  //     ],
  //     toolChoice: { type: 'tool', toolName: 'createMultipleCards' }
  //   });

  //   console.log(toolCards);
  // }
}
