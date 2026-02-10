'use client';

import { formatCurrency } from '@/lib/utils/format';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PaymentBreakdownProps {
  monthlyPI: number;
  monthlyPropertyTax: number;
  monthlyMelloRoos: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  monthlyMaintenance: number;
  monthlyUtilities: number;
  extraMonthly: number;
  monthlyPITI: number;
  trueMonthlyCost: number;
}

interface LineItemConfig {
  label: string;
  value: number;
  color: string;
  optional: boolean;
}

function LineItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center justify-between py-2 pl-3 border-l-4 ${color}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium">{formatCurrency(value)}</span>
    </div>
  );
}

export function PaymentBreakdown({
  monthlyPI,
  monthlyPropertyTax,
  monthlyMelloRoos,
  monthlyInsurance,
  monthlyHOA,
  monthlyPMI,
  monthlyMaintenance,
  monthlyUtilities,
  extraMonthly,
  monthlyPITI,
  trueMonthlyCost,
}: PaymentBreakdownProps) {
  const lineItems: LineItemConfig[] = [
    { label: 'Principal & Interest', value: monthlyPI, color: 'border-blue-500', optional: false },
    { label: 'Property Tax', value: monthlyPropertyTax, color: 'border-amber-500', optional: false },
    { label: 'Mello-Roos', value: monthlyMelloRoos, color: 'border-amber-400', optional: true },
    { label: 'Insurance', value: monthlyInsurance, color: 'border-green-500', optional: false },
    { label: 'HOA', value: monthlyHOA, color: 'border-purple-500', optional: true },
    { label: 'PMI', value: monthlyPMI, color: 'border-red-500', optional: true },
    { label: 'Maintenance', value: monthlyMaintenance, color: 'border-teal-500', optional: false },
    { label: 'Utilities', value: monthlyUtilities, color: 'border-sky-500', optional: false },
    { label: 'Extra Payments', value: extraMonthly, color: 'border-indigo-500', optional: true },
  ];

  const visibleItems = lineItems.filter((item) => !item.optional || item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Payment Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {visibleItems.map((item) => (
          <LineItem key={item.label} label={item.label} value={item.value} color={item.color} />
        ))}

        <div className="border-t my-3" />

        <div className="flex items-center justify-between py-2 pl-3">
          <span className="text-sm font-bold">PITI Total</span>
          <span className="text-sm font-bold">{formatCurrency(monthlyPITI)}</span>
        </div>
        <div className="flex items-center justify-between py-2 pl-3">
          <span className="text-base font-bold text-primary">True Monthly Cost</span>
          <span className="text-base font-bold text-primary">{formatCurrency(trueMonthlyCost)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
