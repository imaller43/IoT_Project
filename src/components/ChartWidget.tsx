import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface ChartSeries {
  dataKey: string;
  name: string;
  color: string;
  yAxisId?: 'left' | 'right';
}

interface ChartWidgetProps {
  title: string;
  rightTitle?: string;
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  leftDomain?: [number | 'auto', number | 'auto'];
  rightDomain?: [number | 'auto', number | 'auto'];
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ title, rightTitle, data, series, xAxisKey, leftDomain, rightDomain }) => {
  const safeData = Array.isArray(data) ? data : [];
  const hasRightAxis = series.some(s => s.yAxisId === 'right');

  return (
    <div className="panel" style={{ height: '350px' }}>
      <div className="panel-header" style={rightTitle ? { display: 'flex', justifyContent: 'space-between', paddingLeft: '20px', paddingRight: '5px' } : undefined}>
        <span>{title}</span>
        {rightTitle && <span>{rightTitle}</span>}
      </div>
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={`color-${s.dataKey}`} id={`color-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="var(--text-secondary)"
              fontSize={11}
              tickMargin={10}
              tickFormatter={(val) => {
                // Shorten time string for display if needed
                if (!val) return '';
                const parts = val.split(' ');
                return parts.length > 1 ? parts[1] : val;
              }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="var(--text-secondary)" 
              fontSize={11} 
              tickMargin={10} 
              domain={leftDomain || [0, 'auto']} 
            />
            {hasRightAxis && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="var(--text-secondary)" 
                fontSize={11} 
                tickMargin={10} 
                domain={rightDomain || [0, 'auto']} 
              />
            )}
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.875rem' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {series.map((s) => (
              <Area
                key={s.dataKey}
                yAxisId={s.yAxisId || 'left'}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={`url(#color-${s.dataKey})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
