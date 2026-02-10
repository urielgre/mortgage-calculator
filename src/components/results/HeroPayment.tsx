'use client';

import { formatCurrency } from '@/lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';

interface HeroPaymentProps {
  monthlyPayment: number;
  trueMonthlyCost: number;
  monthlyTaxSavings: number;
}

function getPaymentColor(amount: number): string {
  if (amount < 3000) return 'text-green-600';
  if (amount <= 6000) return 'text-foreground';
  return 'text-orange-600';
}

export function HeroPayment({
  monthlyPayment,
  trueMonthlyCost,
  monthlyTaxSavings,
}: HeroPaymentProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center pt-6">
        <p className="sr-only">Monthly mortgage payment:</p>
        <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getPaymentColor(monthlyPayment)}`} aria-live="polite">
          {formatCurrency(monthlyPayment)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Estimated Monthly Payment (PITI)
        </p>

        <div className="w-full border-t my-4" />

        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
          <div>
            <p className="text-base sm:text-lg font-semibold">
              {formatCurrency(trueMonthlyCost)}
            </p>
            <p className="text-xs text-muted-foreground">True Monthly Cost</p>
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold text-green-600">
              {formatCurrency(monthlyTaxSavings)}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Tax Savings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
