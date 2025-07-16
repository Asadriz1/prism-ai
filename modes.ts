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

export default {
  Summary: {
    icon: 'summarize',
    description: 'Get a concise paragraph summarizing the content.',
    prompt: `Generate a paragraph that summarizes this video. Keep it to 3 to 5 \
sentences. Place each sentence of the summary into an object sent to \
set_timecodes with the timecode of the sentence in the video.`,
    staticPrompt:
      'Generate a concise paragraph summarizing this file. Call set_text_output with the result.',
  },

  'Key moments': {
    icon: 'key',
    description: 'List the most important moments as bullet points.',
    prompt: `Generate bullet points for the video. Place each bullet point into an \
object sent to set_timecodes with the timecode of the bullet point in the video.`,
    isList: true,
    staticPrompt:
      'Generate a bulleted list of the key moments or topics in this file. Call set_list_output with the items.',
  },

  'A/V captions': {
    icon: 'closed_caption',
    description: 'Generate descriptive captions for scenes and dialogue.',
    prompt: `For each scene in this video, generate captions that describe the \
    scene along with any spoken text in quotation marks. Place each \
    caption into an object sent to set_timecodes with the timecode of the caption \
    in the video.`,
    isList: true,
    videoOnly: true,
  },

  'Flash Cards': {
    icon: 'style',
    description: 'Create question & answer flash cards for studying.',
    prompt: `Analyze the content of this file. Generate a series of flash cards with a question and a corresponding answer based on the key information. Call the set_flash_cards function with the results.`,
  },

  Haiku: {
    icon: 'edit',
    description: 'Generate a 5-7-5 syllable haiku about the content.',
    prompt: `Generate a haiku for the video. Place each line of the haiku into an \
object sent to set_timecodes with the timecode of the line in the video. Make sure \
to follow the syllable count rules (5-7-5).`,
    staticPrompt:
      'Generate a haiku about the content of this file. Call set_text_output with the result.',
  },

  Table: {
    icon: 'table_chart',
    description: 'List key shots and visible objects in a table format.',
    prompt: `Choose 5 key shots from this video and call set_timecodes_with_objects \
with the timecode, text description of 10 words or less, and a list of objects \
visible in the scene (with representative emojis).`,
    videoOnly: true,
  },

  Chart: {
    icon: 'monitoring',
    description: 'Create a chart of data over the duration of the video.',
    prompt: (input: string) =>
      `Generate chart data for this video based on the following instructions: \
${input}. Call set_timecodes_with_numeric_values once with the list of data values and timecodes.`,
    subModes: {
      Excitement:
        'for each scene, estimate the level of excitement on a scale of 1 to 10',
      Importance:
        'for each scene, estimate the level of overall importance to the video on a scale of 1 to 10',
      'Number of people': 'for each scene, count the number of people visible',
      Custom: 'A custom user-provided prompt.',
    },
    videoOnly: true,
  },

  Custom: {
    icon: 'auto_awesome',
    description: 'Use your own prompt to analyze the content.',
    prompt: (input: string) => input,
  },
} as const;
