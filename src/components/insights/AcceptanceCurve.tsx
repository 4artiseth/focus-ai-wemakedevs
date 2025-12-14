import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface AcceptanceCurveProps {
  data: {
    tooCheap: number;
    bargain: number;
    expensive: number;
    tooExpensive: number;
  };
  currency?: string;
  theme?: 'light' | 'dark';
}

export function AcceptanceCurve({ data, currency = '₹', theme = 'dark' }: AcceptanceCurveProps) {
  // Create smooth acceptance curve data
  const chartData = [
    { price: 0, acceptance: 100 },
    { price: data.tooCheap * 0.5, acceptance: 98 },
    { price: data.tooCheap, acceptance: 95 },
    { price: (data.tooCheap + data.bargain) / 2, acceptance: 90 },
    { price: data.bargain, acceptance: 85 },
    { price: (data.bargain + data.expensive) / 2, acceptance: 70 },
    { price: data.expensive, acceptance: 50 },
    { price: (data.expensive + data.tooExpensive) / 2, acceptance: 30 },
    { price: data.tooExpensive, acceptance: 15 },
    { price: data.tooExpensive * 1.2, acceptance: 5 },
  ];

  const colors = theme === 'dark'
    ? {
        stroke: '#10b981',
        fill: '#10b981',
        grid: 'rgba(255, 255, 255, 0.1)',
      }
    : {
        stroke: '#10b981',
        fill: '#10b981',
        grid: 'rgba(0, 0, 0, 0.1)',
      };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${theme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.fill} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.fill} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis dataKey="price" hide domain={[0, 'dataMax']} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${colors.grid}`,
            borderRadius: '6px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${value}%`, 'Acceptance']}
          labelFormatter={(value) => `${currency}${value}`}
        />
        <Area
          type="monotone"
          dataKey="acceptance"
          stroke={colors.stroke}
          strokeWidth={2}
          fill={`url(#gradient-${theme})`}
          animationDuration={800}
        />
        <ReferenceDot
          x={data.bargain}
          y={85}
          r={4}
          fill={colors.stroke}
          stroke="white"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
