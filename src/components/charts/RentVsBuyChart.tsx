'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface RentVsBuyChartProps {
  data: Array<{
    year: number;
    buyerWealth: number;
    renterWealth: number;
  }>;
  breakEvenYear: number | null;
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

export function RentVsBuyChart({ data, breakEvenYear }: RentVsBuyChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[220px] md:h-[300px] lg:h-[350px]" role="img" aria-label="Rent versus buy wealth comparison over 10 years">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis tickFormatter={formatAxisDollar} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="buyerWealth"
            name="Buyer Wealth"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="renterWealth"
            name="Renter Wealth"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={500}
          />
          {breakEvenYear !== null && (
            <ReferenceLine
              x={breakEvenYear}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{
                value: 'Break Even',
                position: 'top',
                fill: '#6b7280',
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
