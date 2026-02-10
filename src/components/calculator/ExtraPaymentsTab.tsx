'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

function formatMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} years ${months} months`;
}

export function ExtraPaymentsTab() {
  const { inputs, results } = useCalculator();
  const { interestSaved, monthsSaved, originalMonths, newMonths, hasExtraPayments } =
    results.extraPayments;

  if (!hasExtraPayments) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No extra payments configured. Add extra monthly payments or a lump
              sum in the Calculator tab to see potential savings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loan Term</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Original Payoff
              </span>
              <span className="text-sm font-medium">
                {formatMonths(originalMonths)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Savings Hero */}
      <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950">
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            You save {formatCurrency(interestSaved)} in interest!
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
            Pay off {Math.floor(monthsSaved / 12)} years and {monthsSaved % 12}{' '}
            months early
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payoff Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Original Payoff
            </span>
            <span className="text-sm font-medium">
              {formatMonths(originalMonths)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Payoff</span>
            <span className="text-sm font-medium">
              {formatMonths(newMonths)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Months Saved</span>
            <span className="text-sm font-medium">{monthsSaved}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Interest Saved
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(interestSaved)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Extra Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Extra Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Extra Monthly
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(inputs.extraMonthly)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Lump Sum</span>
            <span className="text-sm font-medium">
              {formatCurrency(inputs.lumpSum)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
