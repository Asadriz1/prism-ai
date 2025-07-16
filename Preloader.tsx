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

export default function Preloader() {
  return (
    <div className="preloader">
      <div className="preloader-logo">
        <div className="p1" style={{'--angle': '0deg'} as React.CSSProperties}></div>
        <div className="p2" style={{'--angle': '120deg'} as React.CSSProperties}></div>
        <div className="p3" style={{'--angle': '240deg'} as React.CSSProperties}></div>
      </div>
      <h1 className="preloader-name">Prism AI</h1>
    </div>
  );
}
