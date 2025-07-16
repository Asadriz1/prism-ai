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
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {timeToSecs} from './utils';

const formatTime = (t: number) =>
  `${Math.floor(t / 60)}:${Math.floor(t % 60)
    .toString()
    .padStart(2, '0')}`;

export default function VideoPlayer({
  url,
  timecodeList,
  requestedTimecode,
  isLoadingVideo,
  videoError,
  jumpToTimecode,
}: {
  url: string | null;
  timecodeList: any[] | null;
  requestedTimecode: number | null;
  isLoadingVideo: boolean;
  videoError: boolean;
  jumpToTimecode: (time: number | null) => void;
}) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [scrubberTime, setScrubberTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string | null>(null);
  const currentSecs = duration * scrubberTime || 0;
  const currentPercent = scrubberTime * 100;

  const timecodeListReversed = useMemo(
    () => (timecodeList ? [...timecodeList].reverse() : null),
    [timecodeList],
  );

  const updateCaption = (currentTime: number) => {
    if (timecodeListReversed) {
      const newCaption =
        timecodeListReversed.find((t) => timeToSecs(t.time) <= currentTime)
          ?.text ?? null;
      setCurrentCaption(newCaption);
    }
  };

  // HTML video element events
  const updateDuration = () => video && setDuration(video.duration);
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const updateTime = () => {
    if (video) {
      if (!isScrubbing) {
        setScrubberTime(video.currentTime / video.duration);
      }
      updateCaption(video.currentTime);
    }
  };

  const togglePlay = useCallback(() => {
    if (video) {
      if (isPlaying) video.pause();
      else video.play();
    }
  }, [isPlaying, video]);

  // Effect to handle seeking requested by parent
  useEffect(() => {
    if (requestedTimecode !== null && video) {
      video.currentTime = requestedTimecode;
      jumpToTimecode(null); // Reset the requested timecode after seeking
    }
  }, [video, requestedTimecode, jumpToTimecode]);

  // Effect to handle keyboard controls
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        e.key === ' '
      ) {
        togglePlay();
      }
    };
    addEventListener('keypress', onKeyPress);
    return () => removeEventListener('keypress', onKeyPress);
  }, [togglePlay]);

  // Effect to reset state on source change
  useEffect(() => {
    setScrubberTime(0);
    setIsPlaying(false);
    setCurrentCaption(null);
  }, [url]);

  const showPlayer = url && !isLoadingVideo && !videoError;

  return (
    <div className="video-player">
      <div className="video-viewport">
        {showPlayer ? (
          <video
            src={url!}
            ref={setVideo}
            onClick={togglePlay}
            preload="auto"
            crossOrigin="anonymous"
            onDurationChange={updateDuration}
            onTimeUpdate={updateTime}
            onPlay={onPlay}
            onPause={onPause}
          />
        ) : (
          <div className="video-placeholder">
            <p>
              {isLoadingVideo
                ? 'Processing file...'
                : videoError
                ? 'Error processing file.'
                : 'Drag and drop a file to get started.'}
            </p>
          </div>
        )}
        {currentCaption && (
          <div className="video-caption">{currentCaption}</div>
        )}
      </div>

      {showPlayer && (
        <div className="video-controls">
          <div className="timeline">
            <input
              className="timeline-scrubber"
              style={{'--pct': `${currentPercent}%`} as React.CSSProperties}
              type="range"
              min="0"
              max="1"
              value={scrubberTime || 0}
              step="0.000001"
              onChange={(e) => {
                const newScrubberTime = e.target.valueAsNumber;
                setScrubberTime(newScrubberTime);
                if (video) {
                  video.currentTime = newScrubberTime * duration;
                }
              }}
              onPointerDown={() => setIsScrubbing(true)}
              onPointerUp={() => setIsScrubbing(false)}
            />
            <div className="timeline-markers">
              {timecodeList?.map(({time, text, value}, i) => {
                const secs = timeToSecs(time);
                const pct = duration > 0 ? (secs / duration) * 100 : 0;
                return (
                  <div className="timeline-marker" key={i} style={{left: `${pct}%`}}>
                    <div
                      className="timeline-marker-interaction"
                      onClick={() => jumpToTimecode(secs)}>
                      <div className="timeline-marker-label">
                        <p className='label-time'>{time}</p>
                        <p className='label-text'>{value || text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="controls-bar">
            <button className="icon-button" onClick={togglePlay}>
              <span className="icon">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <div className="time-display">
              {formatTime(currentSecs)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
