'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface PMIChartProps {
  purchasePrice: number;
  loanAmount: number;
  monthlyPI: number;
  interestRate: number;
  appreciationRate: number;
  extraMonthly: number;
  autoRemovalMonth: number | null;
  requestRemovalMonth: number | null;
}

interface PMIDataPoint {
  month: number;
  originalLTV: number;
  currentLTV: number;
}

function generatePMIData(props: PMIChartProps): PMIDataPoint[] {
  const {
    purchasePrice,
    loanAmount,
    monthlyPI,
    interestRate,
    appreciationRate,
    extraMonthly,
    autoRemovalMonth,
  } = props;

  const monthlyRate = interestRate / 100 / 12;
  const maxMonths = Math.min(
    360,
    autoRemovalMonth !== null ? autoRemovalMonth + 24 : 120,
  );
  const maxDisplay = Math.max(maxMonths, 120);

  const points: PMIDataPoint[] = [];
  let balance = loanAmount;

  for (let month = 0; month <= maxDisplay; month++) {
    if (balance <= 0) break;

    const currentValue =
      purchasePrice * Math.pow(1 + appreciationRate / 100, month / 12);
    const originalLTV = (balance / purchasePrice) * 100;
    const currentLTV = (balance / currentValue) * 100;

    points.push({
      month,
      originalLTV: Math.round(originalLTV * 100) / 100,
      currentLTV: Math.round(currentLTV * 100) / 100,
    });

    if (month < maxDisplay) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment + extraMonthly;
      balance = Math.max(0, balance - principalPayment);
    }
  }

  return points;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
      <p className="mb-1 text-sm font-medium text-gray-700">Month {label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function PMIChart(props: PMIChartProps) {
  const { autoRemovalMonth, requestRemovalMonth } = props;

  const data = useMemo(() => generatePMIData(props), [
    props.purchasePrice,
    props.loanAmount,
    props.monthlyPI,
    props.interestRate,
    props.appreciationRate,
    props.extraMonthly,
    props.autoRemovalMonth,
  ]);

  if (data.length === 0) return null;

  return (
    <div className="h-[220px] md:h-[300px] lg:h-[350px]" role="img" aria-label="PMI loan-to-value ratio timeline">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis tickFormatter={formatPercent} width={50} domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="originalLTV"
            name="Original LTV"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="currentLTV"
            name="Current LTV (w/ Appreciation)"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
          <ReferenceLine
            y={78}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: 'Auto Cancel (78%)',
              position: 'right',
              fill: '#ef4444',
              fontSize: 11,
            }}
          />
          <ReferenceLine
            y={80}
            stroke="#f97316"
            strokeDasharray="5 5"
            label={{
              value: 'Request Removal (80%)',
              position: 'right',
              fill: '#f97316',
              fontSize: 11,
            }}
          />
          {autoRemovalMonth !== null && (
            <ReferenceLine
              x={autoRemovalMonth}
              stroke="#ef4444"
              label={{
                value: `Auto @ Mo. ${autoRemovalMonth}`,
                position: 'top',
                fill: '#ef4444',
                fontSize: 11,
              }}
            />
          )}
          {requestRemovalMonth !== null && (
            <ReferenceLine
              x={requestRemovalMonth}
              stroke="#f97316"
              strokeDasharray="5 5"
              label={{
                value: `Request @ Mo. ${requestRemovalMonth}`,
                position: 'top',
                fill: '#f97316',
                fontSize: 11,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
