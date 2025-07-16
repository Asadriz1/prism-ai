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

import {useState} from 'react';
import c from 'classnames';

interface FlashCardProps {
  question: string;
  answer: string;
}

export default function FlashCard({question, answer}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={c('flashcard', {flipped: isFlipped})}
      onClick={() => setIsFlipped(!isFlipped)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flashcard-content">
            <span className="flashcard-label">Question</span>
            <p>{question}</p>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-content">
            <span className="flashcard-label">Answer</span>
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
