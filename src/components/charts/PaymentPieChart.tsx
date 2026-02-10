'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface PaymentPieChartProps {
  pi: number;
  tax: number;
  insurance: number;
  hoa: number;
  pmi: number;
  maintenance: number;
  utilities: number;
}

interface SliceEntry {
  name: string;
  value: number;
  color: string;
}

const SEGMENTS: { key: keyof PaymentPieChartProps; label: string; color: string }[] = [
  { key: 'pi', label: 'P&I', color: '#3b82f6' },
  { key: 'tax', label: 'Property Tax', color: '#f59e0b' },
  { key: 'insurance', label: 'Insurance', color: '#22c55e' },
  { key: 'hoa', label: 'HOA', color: '#a855f7' },
  { key: 'pmi', label: 'PMI', color: '#ef4444' },
  { key: 'maintenance', label: 'Maintenance', color: '#14b8a6' },
  { key: 'utilities', label: 'Utilities', color: '#0ea5e9' },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-medium text-gray-700">{name}</p>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(value)}</p>
    </div>
  );
}

export function PaymentPieChart(props: PaymentPieChartProps) {
  const data: SliceEntry[] = SEGMENTS.filter((s) => props[s.key] > 0).map((s) => ({
    name: s.label,
    value: props[s.key],
    color: s.color,
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-[250px] md:h-[300px] lg:h-[350px]" role="img" aria-label="Payment breakdown pie chart showing principal, tax, insurance, and other costs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            animationDuration={500}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
