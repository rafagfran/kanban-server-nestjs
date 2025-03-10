import { OpenAI } from 'openai';
import { CardCreateInput } from 'src/types/types';

function defineParameters<T extends Record<string, unknown>>(parameters: {
  properties: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean';
      description: string;
    };
  };
  required?: (keyof T)[];
}) {
  return parameters;
}

export const toolsDefinition: OpenAI.FunctionDefinition[] = [
  {
    name: 'create_card',
    parameters: defineParameters<CardCreateInput>({
      properties: {
        title: {
          type: 'string',
          description: 'Título do card'
        },
        columnId: {
          type: 'number',
          description: 'ID da coluna que o card pertence'
        }
      },
      required: ['title', 'columnId']
    })
  },
  {
    name: 'create_column',
    description: 'Cria uma nova coluna com um título específico',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título da coluna'
        }
      },
      required: ['title'],
      additionalProperties: false
    }
  }
];
