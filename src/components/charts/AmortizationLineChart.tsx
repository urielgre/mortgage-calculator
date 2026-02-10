'use client';

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface AmortizationLineChartProps {
  data: Array<{
    year: number;
    homeValue: number;
    remainingMortgage: number;
    totalEquity: number;
    yearInterest: number;
    yearPrincipal: number;
  }>;
}

function formatAxisDollar(value: number): string {
  return `$${Math.round(value / 1000)}k`;
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
      <p className="mb-1 text-sm font-medium text-gray-700">Year {label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function AmortizationLineChart({ data }: AmortizationLineChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[220px] md:h-[300px] lg:h-[350px]" role="img" aria-label="Home equity and mortgage balance over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis tickFormatter={formatAxisDollar} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="homeValue"
            name="Home Value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            animationDuration={500}
          />
          <Area
            type="monotone"
            dataKey="totalEquity"
            name="Total Equity"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.15}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="remainingMortgage"
            name="Remaining Mortgage"
            stroke="#ef4444"
            strokeDasharray="5 5"
            dot={false}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
