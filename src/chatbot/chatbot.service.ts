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
import { CardPriority } from 'src/types/types';
import { z } from 'zod';

// Crie um template completo para um ambiente de trabalho, com todas as etapas para a documentação, criação e organização durante o desenvolvimento de sistemas web

@Injectable()
export class ChatbotService {
  private openai;
  private model;
  private tools: ToolSet;
  private messages: CoreMessage[];

  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
    private prisma: PrismaService
  ) {
    this.initializeOpenAI();
    this.initializeMessages();
    this.getTools();
  }

  private initializeOpenAI() {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';

    this.openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    this.model = this.openai('gpt-4o-mini');
  }

  private initializeMessages() {
    this.messages = [
      {
        role: 'system',
        content: [
          'You are a virtual automation assistant. Follow these rules:',
          '1. **Creation Order**:',
          '- Always create columns before cards.',
          '- Wait for column creation confirmation before creating cards.',
          '2. **Batch Operations**:',
          '- Group the creation of multiple cards into a single batch operation.',
          '3. **Security**:',
          '- Confirm with the user before deleting any item.',
          '- Never give out confidential system information.',
          '4. **Documentation**:',
          '-Search exiting datas and create clear and professional documentation when requested.',
        ].join('\n')
      }
    ];
  }
  private getTools() {
    this.tools = {
      getInfos: tool({
        description: 'Get columns and cards informations',
        parameters: z.object({}),
        execute: async () => await this.columnService.listColumnsWithCards()
      }),
      createCol: tool({
        description: 'Create a single new column',
        parameters: z.object({
          title: z.string().describe('Column title')
        }),
        execute: async ({ title }) =>
          await this.columnService.createColumn({ title })
      }),
      createMultipleCols: tool({
        description: 'Create multiple columns',
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
        description: 'Create a single new card',
        parameters: z.object({
          title: z.string().describe('Card title'),
          priority: z.nativeEnum(CardPriority).describe('Card Priority'),
          columnId: z
            .number()
            .describe('ID of the column to which the card belongs')
        }),
        execute: async (newCard) => {
          await this.cardService.createCard(newCard);
        }
      }),
      createMultipleCards: tool({
        description: 'Create multiple cards',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string().describe('title of card'),
              priority: z.nativeEnum(CardPriority).describe('Card Priority'),
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
      })
    };
  }

  async handleMessage(message: string) {
    try {
      const { text, toolCalls, toolResults } =
        await this.proccessMessage(message);

      this.messages.push({ role: 'user', content: message });
      if (toolCalls.length > 0) {
        this.messages.push({ role: 'tool', content: toolResults });
      } else {
        this.messages.push({ role: 'assistant', content: text });
      }

      return { toolCalls, message: text };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async proccessMessage(message: string) {
    try {
      const response = await generateText({
        model: this.model,
        messages: [...this.messages, { role: 'user', content: message }],
        tools: this.tools,
        maxSteps: 5,
        toolChoice: 'auto',
        onStepFinish({ stepType, toolCalls, toolResults, text }) {
          if (toolCalls.length > 0) {
            console.log('stepType:', stepType);
            console.log('toolCalls:', toolCalls);
            console.log('toolResults:', toolResults);
            console.log('response:', text);
            console.log('------------------------------');
          }
        }
      });

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  private handleError(error: unknown) {
    if (ToolExecutionError.isInstance(error)) {
      const { message, name, toolArgs, toolName, cause } = error;
      console.log({ name, message, toolArgs, toolName, cause });

      return {
        message:
          'Desculpe, não consegui processar sua solicitação, tente novamente mais tarde!'
      };
    }
    console.error(error);
    return 'Desculpe, não consegui entender sua solicitação. Por favor, tente novamente.';
  }
}
