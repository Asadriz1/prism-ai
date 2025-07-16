/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {FunctionDeclaration, Type} from '@google/genai';

const flashCardDeclaration: FunctionDeclaration = {
  name: 'set_flash_cards',
  description: 'Set a list of flash cards with a question and an answer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      cards: {
        type: Type.ARRAY,
        description: 'The list of flash cards to display.',
        items: {
          type: Type.OBJECT,
          properties: {
            question: {type: Type.STRING},
            answer: {type: Type.STRING},
          },
          required: ['question', 'answer'],
        },
      },
    },
    required: ['cards'],
  },
};

export const videoFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'set_timecodes',
    description: 'Set the timecodes for the video with associated text',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timecodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: {
                type: Type.STRING,
              },
              text: {
                type: Type.STRING,
              },
            },
            required: ['time', 'text'],
          },
        },
      },
      required: ['timecodes'],
    },
  },
  {
    name: 'set_timecodes_with_objects',
    description:
      'Set the timecodes for the video with associated text and object list',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timecodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: {
                type: Type.STRING,
              },
              text: {
                type: Type.STRING,
              },
              objects: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
            required: ['time', 'text', 'objects'],
          },
        },
      },
      required: ['timecodes'],
    },
  },
  {
    name: 'set_timecodes_with_numeric_values',
    description:
      'Set the timecodes for the video with associated numeric values',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timecodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: {
                type: Type.STRING,
              },
              value: {
                type: Type.NUMBER,
              },
            },
            required: ['time', 'value'],
          },
        },
      },
      required: ['timecodes'],
    },
  },
  flashCardDeclaration,
];

export const staticFileFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'set_text_output',
    description: 'Set a text output, such as a paragraph or summary.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description: 'The text output to display.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_list_output',
    description: 'Set a list of text items as output.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: 'The list of items to display.',
          items: {
            type: Type.STRING,
          },
        },
      },
      required: ['items'],
    },
  },
  flashCardDeclaration,
];
