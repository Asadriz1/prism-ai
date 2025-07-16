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

import c from 'classnames';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {File as GenAIFile} from '@google/genai';
import {generateContent, uploadFile} from './api';
import Chart from './Chart.jsx';
import FilePreviewer from './FilePreviewer.jsx';
import FlashCard from './FlashCard.jsx';
import {
  staticFileFunctionDeclarations,
  videoFunctionDeclarations,
} from './functions';
import modes from './modes';
import Preloader from './Preloader.jsx';
import {timeToSecs} from './utils';
import VideoPlayer from './VideoPlayer.jsx';

const chartModes = Object.keys(modes.Chart.subModes).filter(
  (m) => m !== 'Custom',
);

type FileType = 'video' | 'image' | 'document';
type View = 'grid' | 'custom' | 'chart' | 'output' | 'loading';

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [file, setFile] = useState<GenAIFile | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);

  const [timecodeList, setTimecodeList] = useState<any[] | null>(null);
  const [staticOutput, setStaticOutput] = useState<string | string[] | null>(
    null,
  );
  const [flashCards, setFlashCards] = useState<any[] | null>(null);

  const [requestedTimecode, setRequestedTimecode] = useState<number | null>(
    null,
  );
  const [activeMode, setActiveMode] = useState<keyof typeof modes>();
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [chartMode, setChartMode] = useState(chartModes[0]);
  const [chartPrompt, setChartPrompt] = useState('');
  const [chartLabel, setChartLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<View>('grid');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const hasOutput = timecodeList || staticOutput || flashCards;
  useEffect(() => {
    if (hasOutput) {
      setView('output');
    }
  }, [hasOutput]);

  const setTimecodes = ({timecodes}: {timecodes: any[]}) => {
    setTimecodeList(
      timecodes.map((t) => ({...t, text: t.text.replace(/\\'/g, "'")})),
    );
  };

  const setTimecodesWithNumericValues = ({
    timecodes,
  }: {
    timecodes: any[];
  }) => {
    setTimecodeList(timecodes);
  };

  const setTextOutput = ({text}: {text: string}) => {
    setStaticOutput(text);
  };

  const setListOutput = ({items}: {items: string[]}) => {
    setStaticOutput(items);
  };

  const setFlashCardsHandler = ({cards}: {cards: any[]}) => {
    setFlashCards(cards);
  };

  const resetAllOutput = () => {
    setTimecodeList(null);
    setStaticOutput(null);
    setFlashCards(null);
  };

  const resetFileState = () => {
    setFileUrl(null);
    setFile(null);
    setFileName(null);
    setFileType(null);
    resetAllOutput();
    setView('grid');
    setActiveMode(undefined);
    setFileError(false);
  };

  const getFileType = (file: File): FileType | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (
      [
        'application/pdf',
        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // PowerPoint
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ].includes(file.type)
    ) {
      return 'document';
    }
    return null;
  };

  const processFile = async (file: File) => {
    resetFileState();
    setIsLoadingFile(true);

    const type = getFileType(file);
    if (!type) {
      setFileError(true);
      setIsLoadingFile(false);
      console.error('Unsupported file type:', file.type);
      return;
    }

    setFileType(type);
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));

    try {
      const res = await uploadFile(file);
      setFile(res);
      setIsLoadingFile(false);
    } catch (e) {
      setFileError(true);
      setIsLoadingFile(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const onModeSelect = async (mode: keyof typeof modes, subMode?: string) => {
    if (!file) return;

    setActiveMode(mode);
    setView('loading');
    resetAllOutput();

    const currentMode = modes[mode];
    let promptText = '';
    const isVideo = fileType === 'video';

    if (mode === 'Custom') {
      const customInput = subMode || customPrompt;
      // This more general meta-prompt lets the model decide which function to call
      // from the entire provided toolkit, rather than restricting it. This resolves
      // issues where the user asks for an output (e.g. flash cards) that was
      // not covered by the previous, more restrictive prompt.
      promptText = `Analyze the provided file based on the following instructions and call the most appropriate function from the available tools to return the result. Instructions: "${customInput}"`;
    } else if (
      !isVideo &&
      'staticPrompt' in currentMode &&
      currentMode.staticPrompt
    ) {
      promptText = (currentMode as {staticPrompt: string}).staticPrompt;
    } else if (typeof currentMode.prompt === 'function') {
      // Chart
      const input = subMode!;
      promptText = currentMode.prompt(input);
      setChartLabel(isCustomChartMode ? chartPrompt : chartMode);
    } else {
      promptText = currentMode.prompt;
    }

    // Fallback replacement for generic prompts that use "this video"
    const promptSubject = isVideo ? 'video' : 'file';
    promptText = promptText.replace(/this video/g, `this ${promptSubject}`);

    if (!promptText) {
      console.error('Could not determine prompt for mode:', mode);
      setView('grid');
      return;
    }

    const functionDeclarations = isVideo
      ? videoFunctionDeclarations
      : staticFileFunctionDeclarations;

    try {
      const resp = await generateContent(
        promptText,
        functionDeclarations,
        file,
      );
      const call = resp.functionCalls?.[0];

      if (call) {
        ({
          set_timecodes: setTimecodes,
          set_timecodes_with_objects: setTimecodes,
          set_timecodes_with_numeric_values: setTimecodesWithNumericValues,
          set_text_output: setTextOutput,
          set_list_output: setListOutput,
          set_flash_cards: setFlashCardsHandler,
        })[call.name]?.(call.args);
      } else {
        setView('grid'); // No function call returned, go back
      }
    } catch (e) {
      console.error('Error generating content:', e);
      setFileError(true);
      setView('grid');
    }
  };

  const uploadFileHandler = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const availableModes = useMemo(
    () =>
      Object.entries(modes).filter(([key, modeConfig]) => {
        if (fileType !== 'video') {
          return !(modeConfig as {videoOnly?: boolean}).videoOnly;
        }
        return true;
      }),
    [fileType],
  );

  const handleModeClick = (modeKey: keyof typeof modes) => {
    if (modeKey === 'Custom') {
      setView('custom');
    } else if (modeKey === 'Chart') {
      setView('chart');
    } else {
      onModeSelect(modeKey);
    }
  };

  const handleBackToGrid = () => {
    resetAllOutput();
    setView('grid');
    setActiveMode(undefined);
  };

  const handleGenerateCustom = () => {
    onModeSelect('Custom', customPrompt);
  };

  const handleGenerateChart = () => {
    const subMode = isCustomChartMode
      ? chartPrompt
      : modes.Chart.subModes[chartMode as keyof typeof modes.Chart.subModes];
    onModeSelect('Chart', subMode);
  };

  const isCustomChartMode = chartMode === 'Custom';

  const renderHubContent = () => {
    switch (view) {
      case 'loading':
        return (
          <div className="hub-loading">
            <div className="hub-loading-icon">
              <span className="icon">{modes[activeMode!]?.icon}</span>
            </div>
            <h3>{activeMode}</h3>
            <p>Prism AI is thinking...</p>
          </div>
        );
      case 'output':
        return (
          <div className="output-container">
            <div className="output-header">
              <h3>{activeMode}</h3>
              <button className="button" onClick={handleBackToGrid}>
                <span className="icon">arrow_back</span> Back
              </button>
            </div>
            <div className="output-content">
              {timecodeList ? (
                activeMode === 'Table' ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Description</th>
                        <th>Objects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timecodeList.map(({time, text, objects}, i) => (
                        <tr
                          key={i}
                          role="button"
                          onClick={() => setRequestedTimecode(timeToSecs(time))}>
                          <td>
                            <time>{time}</time>
                          </td>
                          <td>{text}</td>
                          <td>{objects.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : activeMode === 'Chart' ? (
                  <Chart
                    data={timecodeList}
                    yLabel={chartLabel}
                    jumpToTimecode={setRequestedTimecode}
                  />
                ) : activeMode &&
                  'isList' in modes[activeMode] &&
                  (modes[activeMode] as {isList?: boolean}).isList ? (
                  <ul className="output-list">
                    {timecodeList.map(({time, text}, i) => (
                      <li key={i}>
                        <button
                          onClick={() =>
                            setRequestedTimecode(timeToSecs(time))
                          }>
                          <time>{time}</time>
                          <span>{text}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="static-output-p">
                    {timecodeList.map(({time, text}, i) => (
                      <span
                        key={i}
                        className="sentence"
                        role="button"
                        onClick={() => setRequestedTimecode(timeToSecs(time))}>
                        <time>{time}</time>
                        <span>{text}</span>{' '}
                      </span>
                    ))}
                  </p>
                )
              ) : flashCards ? (
                <div className="flashcard-grid">
                  {flashCards.map((card, i) => (
                    <FlashCard
                      key={i}
                      question={card.question}
                      answer={card.answer}
                    />
                  ))}
                </div>
              ) : staticOutput ? (
                typeof staticOutput === 'string' ? (
                  <p className="static-output-p">{staticOutput}</p>
                ) : (
                  <ul className="static-output-ul">
                    {staticOutput.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )
              ) : (
                <p>No output was generated.</p>
              )}
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="hub-view">
            <div className="hub-view-header">
              <button
                className="button back-button"
                onClick={() => setView('grid')}>
                <span className="icon">arrow_back</span>
              </button>
              <h3>Custom Prompt</h3>
            </div>
            <textarea
              placeholder="e.g., 'Create a 5-point summary of this file...'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={6}
            />
            <button
              className="button primary"
              onClick={handleGenerateCustom}
              disabled={!customPrompt.trim()}>
              <span className="icon">auto_awesome</span>
              Generate
            </button>
          </div>
        );
      case 'chart':
        return (
          <div className="hub-view">
            <div className="hub-view-header">
              <button
                className="button back-button"
                onClick={() => setView('grid')}>
                <span className="icon">arrow_back</span>
              </button>
              <h3>Chart Analysis</h3>
            </div>
            <div className="mode-list">
              {chartModes.map((mode) => (
                <button
                  key={mode}
                  className={c('button', {
                    active: mode === chartMode && !isCustomChartMode,
                  })}
                  onClick={() => setChartMode(mode)}>
                  {mode}
                </button>
              ))}
            </div>
            <textarea
              className={c({active: isCustomChartMode})}
              placeholder="Or type a custom chart prompt..."
              value={chartPrompt}
              onChange={(e) => setChartPrompt(e.target.value)}
              onFocus={() => setChartMode('Custom')}
              rows={3}
            />
            <button
              className="button primary"
              onClick={handleGenerateChart}
              disabled={isCustomChartMode && !chartPrompt.trim()}>
              <span className="icon">auto_awesome</span>
              Generate
            </button>
          </div>
        );
      case 'grid':
      default:
        return (
          <div className="hub-view">
            <h2 className="hub-title">Analysis Hub</h2>
            <div className="mode-list vertical">
              {availableModes.map(([modeKey, {icon, description}]) => (
                <button
                  key={modeKey}
                  className="mode-button"
                  onClick={() => handleModeClick(modeKey as keyof typeof modes)}>
                  <span className="icon">{icon}</span>
                  <div className="mode-button-text">
                    <h4>{modeKey}</h4>
                    <p>{description}</p>
                  </div>
                  <span className="icon arrow">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {showPreloader && <Preloader />}
      <div className="background-aurora"></div>
      <main className="dark">
        <input
          type="file"
          ref={fileInputRef}
          style={{display: 'none'}}
          onChange={handleFileSelect}
          accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
        />
        {!fileUrl ? (
          <div
            className="landingContainer"
            onDrop={uploadFileHandler}
            onDragOver={(e) => e.preventDefault()}>
            <div className="landing-content">
              <h1>Prism AI</h1>
              <h2>Unlock the Story Within Your Files</h2>
              <p>
                Upload a video, image, or document to begin your analysis with
                the power of AI.
              </p>
              <button
                className="button primary large"
                onClick={() => fileInputRef.current?.click()}>
                <span className="icon">upload_file</span>
                Upload File
              </button>
            </div>
          </div>
        ) : (
          <div className="app-container">
            <header className="app-header">
              <div className="logo">
                <div className="logo-icon"></div>
                Prism AI
              </div>
              <button className="button" onClick={resetFileState}>
                <span className="icon">close</span> Start Over
              </button>
            </header>
            <div className="command-core">
              <div className="preview-pane">
                <div className="preview-pane-inner">
                  {fileType === 'video' ? (
                    <VideoPlayer
                      url={fileUrl}
                      requestedTimecode={requestedTimecode}
                      timecodeList={timecodeList}
                      jumpToTimecode={setRequestedTimecode}
                      isLoadingVideo={isLoadingFile}
                      videoError={fileError}
                    />
                  ) : (
                    <FilePreviewer
                      fileUrl={fileUrl}
                      fileType={fileType}
                      fileName={fileName}
                      isLoading={isLoadingFile}
                      error={fileError}
                    />
                  )}
                </div>
              </div>
              <div className="hub-pane">
                <div className="hub-pane-inner">{renderHubContent()}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
