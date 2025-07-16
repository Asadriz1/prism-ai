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

type FileType = 'video' | 'image' | 'document';

interface FilePreviewerProps {
  fileUrl: string | null;
  fileType: FileType | null;
  fileName: string | null;
  isLoading: boolean;
  error: boolean;
}

export default function FilePreviewer({
  fileUrl,
  fileType,
  fileName,
  isLoading,
  error,
}: FilePreviewerProps) {
  const getFileIcon = () => {
    if (fileType === 'image') return 'image';
    return 'draft';
  };

  const showPreview = fileUrl && !isLoading && !error;

  return (
    <div className="file-previewer">
      {showPreview ? (
        fileType === 'image' && fileUrl ? (
          <img src={fileUrl} alt={fileName ?? 'Uploaded image'} />
        ) : (
          <div className="file-info">
            <span className="icon">{getFileIcon()}</span>
            <span>{fileName}</span>
          </div>
        )
      ) : (
        <div className="file-placeholder">
          <p>
            {isLoading
              ? 'Processing file...'
              : error
              ? 'Error processing file.'
              : 'Upload a file to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
