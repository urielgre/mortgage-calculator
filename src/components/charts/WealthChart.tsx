'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface WealthChartProps {
  data: Array<{
    year: number;
    equityFromPayments: number;
    appreciationGain: number;
    totalEquity: number;
    cumulativeTaxSavings: number;
    totalWealthImpact: number;
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

export function WealthChart({ data }: WealthChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[220px] md:h-[300px] lg:h-[350px]" role="img" aria-label="10-year wealth building breakdown showing equity, appreciation, and tax savings">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis tickFormatter={formatAxisDollar} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="equityFromPayments"
            name="Equity from Payments"
            stackId="wealth"
            fill="#3b82f6"
            radius={[0, 0, 0, 0]}
            animationDuration={500}
          />
          <Bar
            dataKey="appreciationGain"
            name="Appreciation"
            stackId="wealth"
            fill="#22c55e"
            radius={[0, 0, 0, 0]}
            animationDuration={500}
          />
          <Bar
            dataKey="cumulativeTaxSavings"
            name="Tax Savings"
            stackId="wealth"
            fill="#f59e0b"
            radius={[2, 2, 0, 0]}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="totalWealthImpact"
            name="Total Wealth Impact"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
