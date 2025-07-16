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

import {max, min} from 'd3-array';
import {scaleBand, scaleLinear} from 'd3-scale';
import {area, line} from 'd3-shape';
import {useEffect, useRef, useState} from 'react';
import {timeToSecs} from './utils';

interface ChartData {
  time: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  yLabel: string;
  jumpToTimecode: (seconds: number) => void;
}

export default function Chart({data, yLabel, jumpToTimecode}: ChartProps) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const margin = {top: 20, right: 30, bottom: 60, left: 50};
  
  const xMax = width - margin.right;
  const yMax = height - margin.bottom;

  const xScale = scaleBand<string>()
    .range([margin.left, xMax])
    .domain(data.map((d) => d.time))
    .padding(0.2);

  const vals = data.map((d) => d.value);
  const yScale = scaleLinear()
    .domain([min(vals) ?? 0, max(vals) ?? 10])
    .nice()
    .range([yMax, margin.top]);

  const yTicks = yScale.ticks(Math.floor(height / 70));

  const lineGen = line<ChartData>()
    .x((d) => xScale(d.time)! + xScale.bandwidth() / 2)
    .y((d) => yScale(d.value));

  const areaGen = area<ChartData>()
    .x((d) => xScale(d.time)! + xScale.bandwidth() / 2)
    .y0(yMax)
    .y1((d) => yScale(d.value));

  useEffect(() => {
    const setSize = () => {
      if (chartRef.current) {
        setWidth(chartRef.current.clientWidth);
        setHeight(chartRef.current.clientHeight);
      }
    };

    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, []);

  return (
    <svg className="chart-svg" ref={chartRef}>
      <defs>
        <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--glow-color-1)" stopOpacity={0.6} />
          <stop offset="100%" stopColor="var(--glow-color-2)" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Y-Axis Grid Lines and Labels */}
      <g className="y-axis">
        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick} transform={`translate(0, ${y})`}>
              <line x1={margin.left} x2={xMax} />
              <text x={margin.left - 8} dy="0.32em">
                {tick}
              </text>
            </g>
          );
        })}
      </g>

      {/* X-Axis Labels */}
      <g className="x-axis" transform={`translate(0, ${yMax})`}>
        {data.map(({time}, i) => {
          return (
            <text
              key={i}
              x={xScale(time)! + xScale.bandwidth() / 2}
              y={20}
              role="button"
              onClick={() => jumpToTimecode(timeToSecs(time))}>
              {time.length > 5 ? time.replace(/^00:/, '') : time}
            </text>
          );
        })}
      </g>
      
      {/* Area and Line Paths */}
      <g>
        <path className="chart-area" d={areaGen(data) ?? ''} />
        <path className="chart-line" d={lineGen(data) ?? ''} />
      </g>

      {/* Data Points */}
      <g>
        {data.map(({time, value}, i) => {
          const x = xScale(time)! + xScale.bandwidth() / 2;
          const y = yScale(value);
          return (
            <g key={i} className="chart-data-point">
              <circle cx={x} cy={y} r={4} />
              <text x={x} y={y - 12}>
                {value}
              </text>
            </g>
          );
        })}
      </g>

      {/* Y-Axis Title */}
      <text
        className="axis-title"
        transform={`translate(${margin.left-30}, ${height/2}) rotate(-90)`}>
        {yLabel}
      </text>
    </svg>
  );
}
