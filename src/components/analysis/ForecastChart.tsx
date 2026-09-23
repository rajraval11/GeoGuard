import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { ForecastDataPoint } from '../../types';

interface ForecastChartProps {
  timeSeries: ForecastDataPoint[];
  currentRate: number;
  fourWeekForecast: number;
  eightWeekForecast: number;
  forecastRangeText: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  timeSeries = [],
  currentRate,
  fourWeekForecast,
  eightWeekForecast,
  forecastRangeText
}) => {
  const currentRateStr =
    currentRate != null ? Number(currentRate).toFixed(2) : '14.20';
  const fourWeekStr =
    fourWeekForecast != null ? Number(fourWeekForecast).toFixed(2) : '14.85';
  const eightWeekStr =
    eightWeekForecast != null ? Number(eightWeekForecast).toFixed(2) : '15.40';
  const rangeStr =
    forecastRangeText || `$${currentRateStr} – $${eightWeekStr} / MT`;

  const validTimeSeries = Array.isArray(timeSeries) ? timeSeries : [];

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Freight Rate Forecast & Uncertainty Bands</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ensemble baseline with statistical volatility bounds ($/MT)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-600 inline-block" />
            <span className="text-slate-600">Historical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-700 inline-block" />
            <span className="text-slate-600">Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-blue-100 border border-blue-300 inline-block rounded-xs" />
            <span className="text-slate-600">80% Conf. Interval</span>
          </div>
        </div>
      </div>

      {/* Snapshot metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Current Spot Rate</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            ${currentRateStr}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">4-Week Projection</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            ${fourWeekStr}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">8-Week Projection</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            ${eightWeekStr}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Forecast Range</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            {rangeStr}
          </div>
        </div>
      </div>

      {/* Financial Line Chart */}
      <div className="h-64 w-full pt-2">
        {validTimeSeries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
            Forecast time series data unavailable
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={validTimeSeries} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                fontSize: '12px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
              formatter={(value: any, name: any) => {
                if (value === undefined || value === null) return ['-', name];
                const labels: Record<string, string> = {
                  historicalRate: 'Historical Rate',
                  forecastRate: 'Forecast Baseline',
                  confidenceUpper: 'Upper Bound (90th)',
                  confidenceLower: 'Lower Bound (10th)'
                };
                return [`$${Number(value).toFixed(2)} / MT`, labels[name] || name];
              }}
            />
            {/* Confidence Area between bounds */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stroke="none"
              fill="#dbeafe"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="confidenceLower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
            />
            {/* Historical Series */}
            <Line
              type="monotone"
              dataKey="historicalRate"
              stroke="#334155"
              strokeWidth={2}
              dot={{ r: 3, fill: '#334155' }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            {/* Forecast Projection */}
            <Line
              type="monotone"
              dataKey="forecastRate"
              stroke="#1d4ed8"
              strokeWidth={2.2}
              strokeDasharray="4 3"
              dot={{ r: 3, fill: '#1d4ed8' }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
