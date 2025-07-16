/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* tslint:disable */

import {
  File as GenAIFile,
  FunctionDeclaration,
  GoogleGenAI,
  Content,
} from '@google/genai';

const systemInstruction = `When given a file and a query, call the relevant \
function only once with the appropriate data from the file.`;

const client = new GoogleGenAI({apiKey: process.env.API_KEY});

async function generateContent(
  text: string,
  functionDeclarations: FunctionDeclaration[],
  file: GenAIFile,
) {
  const contentRequest: Content = {
    role: 'user',
    parts: [
      {text},
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
    ],
  };

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [contentRequest],
    config: {
      systemInstruction,
      temperature: 0.5,
      tools: [{functionDeclarations}],
    },
  });

  return response;
}

async function uploadFile(file: File) {
  const blob = new Blob([file], {type: file.type});

  console.log('Uploading...');
  const uploadedFile = await client.files.upload({
    file: blob,
    config: {
      displayName: file.name,
    },
  });
  console.log('Uploaded.');
  console.log('Getting...');
  let getFile = await client.files.get({
    name: uploadedFile.name,
  });
  while (getFile.state === 'PROCESSING') {
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
    getFile = await client.files.get({
      name: uploadedFile.name,
    });
    console.log(`current file status: ${getFile.state}`);
    console.log('File is still processing, retrying in 5 seconds');
  }
  console.log(getFile.state);
  if (getFile.state === 'FAILED') {
    throw new Error('File processing failed.');
  }
  console.log('Done');
  return getFile;
}

export {generateContent, uploadFile};
